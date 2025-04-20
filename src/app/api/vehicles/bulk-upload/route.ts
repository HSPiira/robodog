import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const customerId = formData.get('customerId') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
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
                const requiredColumns = [
                    'registration_no', 'make', 'model', 'year',
                    'chassis_no', 'engine_no', 'body_type_id',
                    'category_id', 'vehicle_type_id'
                ];

                const missingColumns = requiredColumns.filter(col => !(col in record));

                if (missingColumns.length > 0) {
                    return NextResponse.json({
                        error: `CSV file is missing required columns: ${missingColumns.join(', ')}`,
                        success: 0,
                        failed: 0,
                    }, { status: 400 });
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
        const results = await Promise.allSettled(
            records.map(async (record, index) => {
                try {
                    // Validate required fields
                    const requiredFields = [
                        'registration_no', 'make', 'model', 'year',
                        'chassis_no', 'engine_no', 'body_type_id',
                        'category_id', 'vehicle_type_id'
                    ];

                    for (const field of requiredFields) {
                        if (!record[field]) {
                            throw new Error(`Row ${index + 2}: Missing required field '${field}'`);
                        }
                    }

                    // Validate year is a number
                    const year = parseInt(record.year);
                    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
                        throw new Error(`Row ${index + 2}: Invalid year value '${record.year}'`);
                    }

                    // Check if registration number already exists
                    const regNo = record.registration_no.trim().toUpperCase();
                    const existingVehicle = await prisma.vehicle.findUnique({
                        where: { registrationNo: regNo }
                    });

                    if (existingVehicle) {
                        throw new Error(`Row ${index + 2}: Vehicle with registration number '${regNo}' already exists`);
                    }

                    // Validate body type ID exists
                    const bodyType = await prisma.bodyType.findUnique({
                        where: { id: record.body_type_id }
                    });

                    if (!bodyType) {
                        throw new Error(`Row ${index + 2}: Invalid body type ID '${record.body_type_id}'`);
                    }

                    // Validate vehicle category ID exists
                    const category = await prisma.vehicleCategory.findUnique({
                        where: { id: record.category_id }
                    });

                    if (!category) {
                        throw new Error(`Row ${index + 2}: Invalid vehicle category ID '${record.category_id}'`);
                    }

                    // Validate vehicle type ID exists
                    const vehicleType = await prisma.vehicleType.findUnique({
                        where: { id: record.vehicle_type_id }
                    });

                    if (!vehicleType) {
                        throw new Error(`Row ${index + 2}: Invalid vehicle type ID '${record.vehicle_type_id}'`);
                    }

                    // If customerId not provided in form but required for vehicle
                    const finalCustomerId = customerId || record.customer_id;
                    if (!finalCustomerId) {
                        throw new Error(`Row ${index + 2}: Customer ID is required`);
                    }

                    // Validate customer ID exists if provided
                    if (finalCustomerId) {
                        const customer = await prisma.customer.findUnique({
                            where: { id: finalCustomerId }
                        });

                        if (!customer) {
                            throw new Error(`Row ${index + 2}: Invalid customer ID '${finalCustomerId}'`);
                        }
                    }

                    // Process optional numeric fields
                    let seatingCapacity = null;
                    let cubicCapacity = null;
                    let grossWeight = null;

                    if (record.seating_capacity) {
                        seatingCapacity = parseInt(record.seating_capacity);
                        if (isNaN(seatingCapacity) || seatingCapacity <= 0) {
                            throw new Error(`Row ${index + 2}: Invalid seating capacity value '${record.seating_capacity}'`);
                        }
                    }

                    if (record.cubic_capacity) {
                        cubicCapacity = parseInt(record.cubic_capacity);
                        if (isNaN(cubicCapacity) || cubicCapacity <= 0) {
                            throw new Error(`Row ${index + 2}: Invalid cubic capacity value '${record.cubic_capacity}'`);
                        }
                    }

                    if (record.gross_weight) {
                        grossWeight = parseFloat(record.gross_weight);
                        if (isNaN(grossWeight) || grossWeight <= 0) {
                            throw new Error(`Row ${index + 2}: Invalid gross weight value '${record.gross_weight}'`);
                        }
                    }

                    // Create the vehicle
                    const vehicle = await prisma.vehicle.create({
                        data: {
                            registrationNo: regNo,
                            make: record.make.trim(),
                            model: record.model.trim(),
                            year: year,
                            bodyTypeId: record.body_type_id,
                            categoryId: record.category_id,
                            vehicleTypeId: record.vehicle_type_id,
                            customerId: finalCustomerId,
                            chassisNo: record.chassis_no.trim(),
                            engineNo: record.engine_no.trim(),
                            chassisNumber: record.chassis_no.trim(),
                            engineNumber: record.engine_no.trim(),
                            seatingCapacity,
                            cubicCapacity,
                            grossWeight,
                            isActive: true,
                        },
                    });

                    return vehicle;
                } catch (error: any) {
                    throw new Error(error.message);
                }
            })
        );

        // Count successes and failures
        let successCount = 0;

        // Collect error messages
        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                successCount++;
            } else {
                errors.push(result.reason.message);
            }
        });

        // Return response with summary
        return NextResponse.json({
            success: successCount,
            failed: records.length - successCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error("Error processing bulk upload:", error);
        return NextResponse.json(
            {
                error: "Failed to process vehicle upload",
                message: error.message,
                success: 0,
                failed: 1
            },
            { status: 500 }
        );
    }
} 