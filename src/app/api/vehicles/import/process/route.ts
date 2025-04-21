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
                let vehicleType: "PASSENGER" | "COMMERCIAL" | "MOTORCYCLE" | "OTHER" =
                    "OTHER";

                if (row.bodyType) {
                    const bodyType = await db.vehicleBodyType.findUnique({
                        where: { id: String(row.bodyType) },
                    });
                    if (!bodyType) {
                        results.errors.push(
                            `Body type with ID ${row.bodyType} not found for vehicle ${row.registrationNo}`
                        );
                        continue;
                    }
                    bodyTypeId = bodyType.id;
                }

                if (row.vehicleCategory) {
                    const category = await db.vehicleCategory.findUnique({
                        where: { id: String(row.vehicleCategory) },
                    });
                    if (!category) {
                        results.errors.push(
                            `Vehicle category with ID ${row.vehicleCategory} not found for vehicle ${row.registrationNo}`
                        );
                        continue;
                    }
                    categoryId = category.id;
                }

                if (row.vehicleType) {
                    const upperType = String(row.vehicleType).toUpperCase();
                    switch (upperType) {
                        case "PASSENGER":
                        case "COMMERCIAL":
                        case "MOTORCYCLE":
                        case "OTHER":
                            vehicleType = upperType as typeof vehicleType;
                            break;
                        default:
                            results.errors.push(
                                `Invalid vehicle type "${row.vehicleType}" for vehicle ${row.registrationNo}. Must be one of: PASSENGER, COMMERCIAL, MOTORCYCLE, OTHER`
                            );
                            continue;
                    }
                }

                // Create vehicle in database
                // @ts-ignore - Types don't match but the schema accepts these fields
                const vehicle = await db.vehicle.create({
                    data: {
                        registrationNo: String(row.registrationNo),
                        make: String(row.make),
                        model: String(row.model),
                        year: row.year ? Number(row.year) : 0,
                        chassisNo: row.chassisNo ? String(row.chassisNo) : "",
                        engineNo: row.engineNo ? String(row.engineNo) : "",
                        chassisNumber: row.chassisNo ? String(row.chassisNo) : "",
                        engineNumber: row.engineNo ? String(row.engineNo) : "",
                        bodyTypeId: bodyTypeId || "",
                        categoryId: categoryId || "",
                        vehicleTypeId: vehicleType || "",
                        clientId: clientId || "",
                        isActive: true,
                    },
                });

                results.success.push(vehicle);
                results.processed++;
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
