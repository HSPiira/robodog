import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StickerStatus } from "@prisma/client";

interface ExcelRow {
    serialNumber: string;
    stickerType: string;
    insurer: string;
    receivedAt: string;
}

// Process items in batches to avoid connection limits
async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processItem: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processItem));
        results.push(...batchResults);
    }
    return results;
}

export async function POST(request: Request) {
    try {
        // Log the incoming request
        console.log("Received upload request");

        const rows: ExcelRow[] = await request.json();
        console.log("Parsed request body:", rows);

        // Validate input data
        if (!Array.isArray(rows)) {
            console.error("Invalid input: Not an array");
            return NextResponse.json(
                { error: "Invalid input: Expected an array of sticker data" },
                { status: 400 }
            );
        }

        if (rows.length === 0) {
            console.error("Invalid input: Empty array");
            return NextResponse.json(
                { error: "Invalid input: No data provided" },
                { status: 400 }
            );
        }

        // Validate each row
        const validationErrors = rows.map((row, index) => {
            const errors = [];
            if (!row.serialNumber) errors.push("serialNumber is required");
            if (!row.stickerType) errors.push("stickerType is required");
            if (!row.insurer) errors.push("insurer is required");
            if (!row.receivedAt) errors.push("receivedAt is required");
            if (row.receivedAt && isNaN(Date.parse(row.receivedAt))) errors.push("invalid date format");
            return errors.length > 0 ? `Row ${index + 1}: ${errors.join(", ")}` : null;
        }).filter(Boolean);

        if (validationErrors.length > 0) {
            console.error("Validation errors:", validationErrors);
            return NextResponse.json(
                { error: validationErrors.join("; ") },
                { status: 400 }
            );
        }

        // Get all existing serial numbers
        console.log("Fetching existing serial numbers");
        const existingSerialNumbers = await prisma.stickerStock.findMany({
            select: { serialNumber: true },
        });
        const existingSerialNumbersSet = new Set(existingSerialNumbers.map(s => s.serialNumber));

        // Filter out rows with duplicate serial numbers
        const uniqueRows = rows.filter(row => !existingSerialNumbersSet.has(row.serialNumber));
        const skippedCount = rows.length - uniqueRows.length;

        if (uniqueRows.length === 0) {
            console.log("All rows were skipped due to duplicates");
            return NextResponse.json({
                success: true,
                created: 0,
                skipped: skippedCount,
                message: "All items were skipped due to duplicate serial numbers"
            });
        }

        console.log(`Processing ${uniqueRows.length} unique rows`);

        // Process sticker types in batches
        console.log("Processing sticker types");
        const stickerTypes = await processInBatches(
            uniqueRows,
            10, // Process 10 items at a time
            row => prisma.stickerType.upsert({
                where: { name: row.stickerType },
                update: {},
                create: { name: row.stickerType },
            })
        );

        // Process insurers in batches
        console.log("Processing insurers");
        const insurers = await processInBatches(
            uniqueRows,
            10, // Process 10 items at a time
            row => prisma.insurer.upsert({
                where: { name: row.insurer },
                update: {},
                create: { name: row.insurer },
            })
        );

        // Create sticker stock entries in batches
        console.log("Creating stock entries");
        const stockEntries = await processInBatches(
            uniqueRows.map((row, index) => ({
                row,
                stickerType: stickerTypes[index],
                insurer: insurers[index]
            })),
            10, // Process 10 items at a time
            async ({ row, stickerType, insurer }) => {
                try {
                    return await prisma.stickerStock.create({
                        data: {
                            serialNumber: row.serialNumber,
                            receivedAt: new Date(row.receivedAt),
                            stickerStatus: StickerStatus.AVAILABLE,
                            stickerType: {
                                connect: { id: stickerType.id }
                            },
                            insurer: {
                                connect: { id: insurer.id }
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error creating stock entry for serial number ${row.serialNumber}:`, error);
                    throw error;
                }
            }
        );

        console.log(`Successfully created ${stockEntries.length} entries`);
        return NextResponse.json({
            success: true,
            created: stockEntries.length,
            skipped: skippedCount,
            message: `Successfully created ${stockEntries.length} items, skipped ${skippedCount} duplicates`
        });
    } catch (error) {
        console.error("Error in upload route:", error);

        // Handle specific Prisma errors
        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return NextResponse.json(
                    { error: "Duplicate serial numbers found in the database" },
                    { status: 400 }
                );
            }
            if (error.message.includes("Invalid date")) {
                return NextResponse.json(
                    { error: "Invalid date format in the receivedAt field" },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to upload stock. Please check the data format and try again." },
            { status: 500 }
        );
    }
} 