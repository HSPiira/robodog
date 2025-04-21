import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as xlsx from "xlsx";

type VehicleType = "PASSENGER" | "COMMERCIAL" | "MOTORCYCLE";

interface VehicleImportRow {
  registrationNo: string;
  make: string;
  model: string;
  year?: string | number;
  chassisNo?: string;
  engineNo?: string;
  bodyType?: string;
  vehicleCategory?: string;
  vehicleType?: string;
  clientId?: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload an Excel or CSV file." },
        { status: 400 }
      );
    }

    // Convert file to array buffer
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet) as VehicleImportRow[];

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "File contains no data" },
        { status: 400 }
      );
    }

    // Process and validate the data
    const results = {
      processed: 0,
      errors: [] as string[],
      success: [] as any[],
    };

    // Process each row
    for (const row of data) {
      try {
        // Basic validation (customize based on your requirements)
        if (!row.registrationNo || !row.make || !row.model) {
          results.errors.push(
            `Row missing required fields: ${JSON.stringify(row)}`
          );
          continue;
        }

        // Check if vehicle already exists
        const existingVehicle = await db.vehicle.findFirst({
          where: {
            registrationNo: String(row.registrationNo),
          },
        });

        if (existingVehicle) {
          results.errors.push(
            `Vehicle with registration ${row.registrationNo} already exists`
          );
          continue;
        }

        // Find client id if specified
        let clientId = null;
        if (row.clientId) {
          // @ts-ignore - client model exists in Prisma but TypeScript doesn't recognize it
          const client = await db.client.findUnique({
            where: { id: String(row.clientId) },
          });

          if (!client) {
            results.errors.push(
              `Client with ID ${row.clientId} not found for vehicle ${row.registrationNo}`
            );
            continue;
          }

          clientId = client.id;
        }

        // Validate bodyType, vehicleCategory, and vehicleType
        let bodyTypeId = null;
        let categoryId = null;
        let vehicleTypeId: string | null = null; // Default to null

        // Handle vehicle type
        if (row.vehicleType) {
          const vehicleTypeCode = String(row.vehicleType).toUpperCase();
          const vt = await db.vehicleType.findFirst({
            where: {
              name: {
                contains: vehicleTypeCode,
                mode: 'insensitive'
              }
            }
          });

          if (!vt) {
            results.errors.push(
              `Vehicle type "${row.vehicleType}" not found for vehicle ${row.registrationNo}`
            );
            continue;
          }
          vehicleTypeId = vt.id;
        }

        // Handle body type
        if (row.bodyType) {
          const bodyTypeStr = String(row.bodyType).toUpperCase();
          const bt = await db.bodyType.findFirst({
            where: {
              name: {
                contains: bodyTypeStr,
                mode: 'insensitive'
              }
            }
          });

          if (bt) {
            bodyTypeId = bt.id;
          }
        }

        // If no body type specified, find a default one
        if (!bodyTypeId) {
          const defaultBodyType = await db.bodyType.findFirst({
            where: { isActive: true },
          });
          if (defaultBodyType) {
            bodyTypeId = defaultBodyType.id;
          } else {
            results.errors.push(
              `No valid body type found for vehicle ${row.registrationNo}`
            );
            continue;
          }
        }

        // Handle vehicle category
        if (row.vehicleCategory) {
          const categoryStr = String(row.vehicleCategory).toUpperCase();
          const cat = await db.vehicleCategory.findFirst({
            where: {
              name: {
                contains: categoryStr,
                mode: 'insensitive'
              }
            }
          });

          if (cat) {
            categoryId = cat.id;
          }
        }

        // If no category specified, find a default one
        if (!categoryId) {
          const defaultCategory = await db.vehicleCategory.findFirst({
            where: { isActive: true },
          });
          if (defaultCategory) {
            categoryId = defaultCategory.id;
          } else {
            results.errors.push(
              `No valid vehicle category found for vehicle ${row.registrationNo}`
            );
            continue;
          }
        }

        // Create vehicle in database
        if (!vehicleTypeId) {
          results.errors.push(
            `Vehicle type is required for vehicle ${row.registrationNo}`
          );
          continue;
        }

        try {
          // Cast the data to match the Prisma schema
          const vehicleData = {
            registrationNo: String(row.registrationNo).toUpperCase(),
            make: String(row.make),
            model: String(row.model),
            year: row.year ? Number(row.year) : new Date().getFullYear(),
            chassisNumber: row.chassisNo ? String(row.chassisNo) : `AUTO-${Date.now()}`,
            engineNumber: row.engineNo ? String(row.engineNo) : `AUTO-${Date.now()}`,
            bodyTypeId: bodyTypeId,       // Now contains a valid ID from the database
            categoryId: categoryId,       // Now contains a valid ID from the database
            vehicleTypeId: vehicleTypeId, // Already contains a valid ID
            clientId: clientId || undefined,
            isActive: true,
          };

          // Using as any to bypass type checking since we've verified the structure
          const vehicle = await db.vehicle.create({
            data: vehicleData as any,
          });

          results.success.push(vehicle);
          results.processed++;
        } catch (error) {
          results.errors.push(
            `Error processing row: ${JSON.stringify(row)} - ${(error as Error).message
            }`
          );
        }
      } catch (error) {
        results.errors.push(
          `Error processing row: ${JSON.stringify(row)} - ${(error as Error).message
          }`
        );
      }
    }

    return NextResponse.json({
      message: "Import completed",
      summary: {
        total: data.length,
        processed: results.processed,
        errors: results.errors.length,
      },
      results,
    });
  } catch (error) {
    console.error("Vehicle import error:", error);
    return NextResponse.json(
      { error: "Failed to process import", details: (error as Error).message },
      { status: 500 }
    );
  }
}
