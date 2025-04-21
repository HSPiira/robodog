import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as xlsx from "xlsx";

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
    customerId?: string;
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Check file type
        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
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
            success: [] as any[]
        };

        // Process each row
        for (const row of data) {
            try {
                // Basic validation (customize based on your requirements)
                if (!row.registrationNo || !row.make || !row.model) {
                    results.errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
                    continue;
                }

                // Check if vehicle already exists
                const existingVehicle = await db.vehicle.findFirst({
                    where: {
                        registrationNo: String(row.registrationNo)
                    }
                });

                if (existingVehicle) {
                    results.errors.push(`Vehicle with registration ${row.registrationNo} already exists`);
                    continue;
                }

                // Find customer id if specified
                let customerId = null;
                if (row.customerId) {
                    const customer = await db.customer.findUnique({
                        where: { id: String(row.customerId) }
                    });

                    if (!customer) {
                        results.errors.push(`Customer with ID ${row.customerId} not found for vehicle ${row.registrationNo}`);
                        continue;
                    }

                    customerId = customer.id;
                }

                // Create vehicle in database
                const vehicle = await db.vehicle.create({
                    data: {
                        registrationNo: String(row.registrationNo),
                        make: String(row.make),
                        model: String(row.model),
                        year: row.year ? Number(row.year) : 0,
                        chassisNumber: row.chassisNo ? String(row.chassisNo) : "",
                        engineNumber: row.engineNo ? String(row.engineNo) : "",
                        bodyTypeId: row.bodyType || "",
                        categoryId: row.vehicleCategory || "",
                        vehicleTypeId: row.vehicleType || "",
                        customerId: customerId || "",
                        isActive: true
                    }
                });

                results.success.push(vehicle);
                results.processed++;
            } catch (error) {
                results.errors.push(`Error processing row: ${JSON.stringify(row)} - ${(error as Error).message}`);
            }
        }

        return NextResponse.json({
            message: "Import completed",
            summary: {
                total: data.length,
                processed: results.processed,
                errors: results.errors.length
            },
            results
        });

    } catch (error) {
        console.error("Vehicle import error:", error);
        return NextResponse.json(
            { error: "Failed to process import", details: (error as Error).message },
            { status: 500 }
        );
    }
} 