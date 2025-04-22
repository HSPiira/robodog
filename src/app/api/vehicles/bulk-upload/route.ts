import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse";
import { auth } from "@/lib/auth";
import path from "path";
import fs from "fs";

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

// Process items in batches with concurrency control
async function processBatchesWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => fn(item, i + batchIndex))
    );
    results.push(...batchResults);
  }

  return results;
}

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Get the authenticated user from the database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Authenticated user not found in database" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string | null;
    const rawMethod = (formData.get("importMethod") as string | null)?.toLowerCase() ?? "ids";
    const importMethod: "names" | "ids" = rawMethod === "names" ? "names" : "ids";

    // Get reference data maps for name-based imports
    let bodyTypesMap: { id: string, name: string }[] = [];
    let vehicleCategoriesMap: { id: string, name: string }[] = [];
    let vehicleTypesMap: { id: string, name: string }[] = [];
    let clientsMap: { id: string, name: string }[] = [];

    if (importMethod === 'names') {
      try {
        const bodyTypesJson = formData.get("bodyTypesMap") as string;
        const vehicleCategoriesJson = formData.get("vehicleCategoriesMap") as string;
        const vehicleTypesJson = formData.get("vehicleTypesMap") as string;
        const clientsJson = formData.get("clientsMap") as string;

        if (bodyTypesJson) bodyTypesMap = JSON.parse(bodyTypesJson);
        if (vehicleCategoriesJson) vehicleCategoriesMap = JSON.parse(vehicleCategoriesJson);
        if (vehicleTypesJson) vehicleTypesMap = JSON.parse(vehicleTypesJson);
        if (clientsJson) clientsMap = JSON.parse(clientsJson);
      } catch (error) {
        console.error("Error parsing reference data maps:", error);
        return NextResponse.json(
          { error: "Invalid reference data sent from client" },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const fileType = file.type;
    const validTypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only CSV files are accepted.",
        },
        { status: 400 }
      );
    }

    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File size exceeds the limit of 5MB.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileContent = buffer.toString();

    // Process the CSV file
    const records: any[] = [];
    const errors: string[] = [];
    let headerValidated = false;

    // Parse the CSV content
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Process each record from the CSV
    for await (const record of parser) {
      // Validate headers on first record
      if (!headerValidated) {
        const requiredColumns = importMethod === 'names'
          ? [
            "registration_no",
            "make",
            "model",
            "year",
            "chassis_no",
            "engine_no",
            "body_type",
            "category",
            "vehicle_type"
          ]
          : [
            "registration_no",
            "make",
            "model",
            "year",
            "chassis_no",
            "engine_no",
            "body_type_id",
            "category_id",
            "vehicle_type_id"
          ];

        // Check if client column/ID is required
        if (!clientId) {
          requiredColumns.push(importMethod === 'names' ? "client" : "client_id");
        }

        const missingColumns = requiredColumns.filter(
          (col) => !(col in record)
        );

        if (missingColumns.length > 0) {
          return NextResponse.json(
            {
              error: `CSV file is missing required columns: ${missingColumns.join(
                ", "
              )}`,
              success: 0,
              failed: 0,
            },
            { status: 400 }
          );
        }

        headerValidated = true;
      }

      // Add to records array for processing
      records.push(record);

      // Limit to 500 records for performance reasons
      if (records.length >= 500) {
        break;
      }
    }

    // Process the validated records
    const results = await processBatchesWithConcurrency(
      records,
      15,
      async (record, index) => {
        try {
          // Check import method and set field names accordingly
          const bodyTypeField = importMethod === 'names' ? 'body_type' : 'body_type_id';
          const categoryField = importMethod === 'names' ? 'category' : 'category_id';
          const vehicleTypeField = importMethod === 'names' ? 'vehicle_type' : 'vehicle_type_id';
          const clientField = importMethod === 'names' ? 'client' : 'client_id';

          // Validate required fields
          const requiredFields = [
            "registration_no",
            "make",
            "model",
            "year",
            "chassis_no",
            "engine_no",
            bodyTypeField,
            categoryField,
            vehicleTypeField,
          ];

          // Add client field if no client ID was provided in the form
          if (!clientId) {
            requiredFields.push(clientField);
          }

          for (const field of requiredFields) {
            if (!record[field]) {
              throw new Error(
                `Row ${index + 2}: Missing required field '${field}'`
              );
            }
          }

          // Validate year is a number
          const year = parseInt(record.year);
          if (
            isNaN(year) ||
            year < 1900 ||
            year > new Date().getFullYear() + 1
          ) {
            throw new Error(
              `Row ${index + 2}: Invalid year value '${record.year}'`
            );
          }

          // Check if registration number already exists
          const regNo = record.registration_no.trim().toUpperCase();
          const existingVehicle = await prisma.vehicle.findUnique({
            where: { registrationNo: regNo },
          });

          if (existingVehicle) {
            throw new Error(
              `Row ${index + 2
              }: Vehicle with registration number '${regNo}' already exists`
            );
          }

          // Handle ID resolution based on import method
          let bodyTypeId: string;
          let categoryId: string;
          let vehicleTypeId: string;
          let finalClientId: string = clientId || '';

          if (importMethod === 'names') {
            // Find body type by name
            const bodyTypeName = record[bodyTypeField].trim();
            const bodyType = bodyTypesMap.find(bt =>
              bt.name.toLowerCase() === bodyTypeName.toLowerCase()
            );

            if (!bodyType) {
              throw new Error(
                `Row ${index + 2}: Body type '${bodyTypeName}' not found in the system`
              );
            }
            bodyTypeId = bodyType.id;

            // Find vehicle category by name
            const categoryName = record[categoryField].trim();
            const category = vehicleCategoriesMap.find(cat =>
              cat.name.toLowerCase() === categoryName.toLowerCase()
            );

            if (!category) {
              throw new Error(
                `Row ${index + 2}: Vehicle category '${categoryName}' not found in the system`
              );
            }
            categoryId = category.id;

            // Find vehicle type by name
            const vehicleTypeName = record[vehicleTypeField].trim();
            const vehicleType = vehicleTypesMap.find(vt =>
              vt.name.toLowerCase() === vehicleTypeName.toLowerCase()
            );

            if (!vehicleType) {
              throw new Error(
                `Row ${index + 2}: Vehicle type '${vehicleTypeName}' not found in the system`
              );
            }
            vehicleTypeId = vehicleType.id;

            // If no client ID provided in the form, resolve client by name
            if (!clientId && record[clientField]) {
              const clientName = record[clientField].trim();
              const client = clientsMap.find(c =>
                c.name.toLowerCase() === clientName.toLowerCase()
              );

              if (!client) {
                throw new Error(
                  `Row ${index + 2}: Client '${clientName}' not found in the system`
                );
              }
              finalClientId = client.id;
            }
          } else {
            // Traditional ID-based validation
            // Validate body type ID exists
            bodyTypeId = record[bodyTypeField];
            const bodyType = await prisma.bodyType.findUnique({
              where: { id: bodyTypeId },
            });

            if (!bodyType) {
              throw new Error(
                `Row ${index + 2}: Invalid body type ID '${bodyTypeId}'`
              );
            }

            // Validate vehicle category ID exists
            categoryId = record[categoryField];
            const category = await prisma.vehicleCategory.findUnique({
              where: { id: categoryId },
            });

            if (!category) {
              throw new Error(
                `Row ${index + 2}: Invalid vehicle category ID '${categoryId}'`
              );
            }

            // Validate vehicle type ID exists
            vehicleTypeId = record[vehicleTypeField];
            const vehicleType = await prisma.vehicleType.findUnique({
              where: { id: vehicleTypeId },
            });

            if (!vehicleType) {
              throw new Error(
                `Row ${index + 2}: Invalid vehicle type ID '${vehicleTypeId}'`
              );
            }

            // If clientId not provided in form but required for vehicle
            finalClientId = clientId || record[clientField];
          }

          if (!finalClientId) {
            throw new Error(`Row ${index + 2}: Client ID is required`);
          }

          // Validate client ID exists if provided
          const client = await prisma.client.findUnique({
            where: { id: finalClientId },
          });

          if (!client) {
            throw new Error(
              `Row ${index + 2}: Invalid client ID '${finalClientId}'`
            );
          }

          // Process optional numeric fields
          let seatingCapacity = null;
          let cubicCapacity = null;
          let grossWeight = null;

          if (record.seating_capacity) {
            seatingCapacity = parseInt(record.seating_capacity);
            if (isNaN(seatingCapacity) || seatingCapacity <= 0) {
              throw new Error(
                `Row ${index + 2}: Invalid seating capacity value '${record.seating_capacity
                }'`
              );
            }
          }

          if (record.cubic_capacity) {
            cubicCapacity = parseInt(record.cubic_capacity);
            if (isNaN(cubicCapacity) || cubicCapacity <= 0) {
              throw new Error(
                `Row ${index + 2}: Invalid cubic capacity value '${record.cubic_capacity
                }'`
              );
            }
          }

          if (record.gross_weight) {
            grossWeight = parseFloat(record.gross_weight);
            if (isNaN(grossWeight) || grossWeight <= 0) {
              throw new Error(
                `Row ${index + 2}: Invalid gross weight value '${record.gross_weight
                }'`
              );
            }
          }

          // Create vehicle record
          const vehicleData = {
            registrationNo: regNo,
            make: record.make.trim(),
            model: record.model.trim(),
            year,
            bodyTypeId,
            categoryId,
            vehicleTypeId,
            clientId: finalClientId,
            chassisNumber: record.chassis_no.trim(),
            engineNumber: record.engine_no.trim(),
            seatingCapacity: record.seating_capacity
              ? parseInt(record.seating_capacity)
              : null,
            cubicCapacity: record.cubic_capacity
              ? parseInt(record.cubic_capacity)
              : null,
            grossWeight: record.gross_weight
              ? parseInt(record.gross_weight)
              : null,
            isActive: true,
            createdBy: dbUser.id,
            updatedBy: dbUser.id,
          };

          await prisma.vehicle.create({
            data: vehicleData,
          });

          return { success: true };
        } catch (error: any) {
          errors.push(error.message);
          return { success: false, error: error.message };
        }
      }
    );

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: successCount,
      failed: failureCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error processing vehicle import:", error);
    return NextResponse.json(
      { error: "Failed to process vehicle import" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Authenticate the user
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the template file path
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'vehicle-import-template.csv');

    // Check if file exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: "Template file not found" },
        { status: 404 }
      );
    }

    // Read the file
    const fileContent = fs.readFileSync(templatePath);

    // Return the file with appropriate headers
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="vehicle-import-template.csv"'
      }
    });
  } catch (error) {
    console.error("Error processing vehicle import:", error);
    return NextResponse.json(
      { error: "Failed to process vehicle import" },
      { status: 500 }
    );
  }
}
