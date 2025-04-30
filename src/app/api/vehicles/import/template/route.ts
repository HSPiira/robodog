import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
    try {
        // Fetch reference data to include in separate sheets
        const [clients, vehicleTypes, bodyTypes, categories] = await Promise.all([
            prisma.client.findMany({
                select: {
                    id: true,
                    name: true,
                },
                where: {
                    isActive: true,
                },
            }),
            prisma.vehicleType.findMany({
                select: {
                    id: true,
                    name: true,
                },
                where: {
                    isActive: true,
                },
            }),
            prisma.bodyType.findMany({
                select: {
                    id: true,
                    name: true,
                },
                where: {
                    isActive: true,
                },
            }),
            prisma.vehicleCategory.findMany({
                select: {
                    id: true,
                    name: true,
                },
                where: {
                    isActive: true,
                },
            }),
        ]);

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Create main template sheet
        const templateData = [
            {
                registration_no: "ABC123",
                make: "Toyota",
                model: "Corolla",
                year: 2023,
                body_type: "Sedan",    // Can use name or ID
                category: "Personal",  // Can use name or ID
                vehicle_type: "Car",   // Can use name or ID
                owner: "John Doe",     // Can use name or ID
                chassis_no: "ABCD1234567890",
                engine_no: "ENG123456",
                seating_capacity: 5,
                cubic_capacity: 1800,
                gross_weight: 1500,
            },
            {
                registration_no: "XYZ789",
                make: "Honda",
                model: "Civic",
                year: 2022,
                body_type: "Sedan",
                category: "Personal",
                vehicle_type: "Car",
                owner: "Jane Smith",
                chassis_no: "WXYZ7654321098",
                engine_no: "ENG654321",
                seating_capacity: 5,
                cubic_capacity: 1600,
                gross_weight: 1400,
            }
        ];

        // Convert to worksheet and add to workbook
        const templateSheet = XLSX.utils.json_to_sheet(templateData);
        XLSX.utils.book_append_sheet(workbook, templateSheet, "Vehicle Template");

        // Add column descriptions sheet
        const columnsDescriptions = [
            { field: "registration_no", description: "Vehicle registration number (required)", example: "KAA 123A" },
            { field: "make", description: "Vehicle manufacturer (required)", example: "Toyota, Honda, etc." },
            { field: "model", description: "Vehicle model (required)", example: "Corolla, Civic, etc." },
            { field: "year", description: "Manufacturing year (required)", example: "2023" },
            { field: "body_type", description: "Body type name or ID", example: "Sedan, SUV, etc." },
            { field: "category", description: "Vehicle category name or ID", example: "Personal, Commercial, etc." },
            { field: "vehicle_type", description: "Vehicle type name or ID", example: "Car, Truck, etc." },
            { field: "owner", description: "Owner/customer name or ID", example: "John Doe" },
            { field: "chassis_no", description: "Vehicle chassis number", example: "ABCD1234567890" },
            { field: "engine_no", description: "Vehicle engine number", example: "ENG123456" },
            { field: "seating_capacity", description: "Number of seats (optional)", example: "5" },
            { field: "cubic_capacity", description: "Engine cubic capacity (optional)", example: "1800" },
            { field: "gross_weight", description: "Gross weight in kg (optional)", example: "1500" },
        ];

        const columnsSheet = XLSX.utils.json_to_sheet(columnsDescriptions);
        XLSX.utils.book_append_sheet(workbook, columnsSheet, "Column Descriptions");

        // Add reference data sheets
        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(vehicleTypes),
            "Vehicle Types"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(bodyTypes),
            "Body Types"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(categories),
            "Vehicle Categories"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(clients),
            "Clients"
        );

        // Create buffer
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Return as downloadable file
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=vehicle_import_template.xlsx",
            },
        });
    } catch (error) {
        console.error("Error generating vehicle import template:", error);
        return NextResponse.json(
            { error: "Failed to generate template" },
            { status: 500 }
        );
    }
} 