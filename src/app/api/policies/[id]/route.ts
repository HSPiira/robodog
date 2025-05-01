import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PolicyStatus } from "@prisma/client";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const policy = await prisma.policy.findUnique({
            where: {
                id: params.id,
                isActive: true,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                vehicle: {
                    select: {
                        id: true,
                        registrationNo: true,
                        make: true,
                        model: true,
                    },
                },
                insurer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!policy || !policy.vehicle) {
            return new NextResponse("Policy not found or not linked to a vehicle", { status: 404 });
        }

        return NextResponse.json(policy);
    } catch (error) {
        console.error("Error fetching policy:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const {
            policyNo,
            clientId,
            vehicleId,
            insurerId,
            status,
            validFrom,
            validTo,
            premium,
            stampDuty,
            remarks,
        } = body;

        // Validate required fields
        if (status && !Object.values(PolicyStatus).includes(status)) {
            return new NextResponse("Invalid policy status", { status: 400 });
        }

        if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
            return new NextResponse("Valid from date must be before valid to date", { status: 400 });
        }

        if (premium !== undefined && isNaN(Number(premium))) {
            return new NextResponse("Premium must be a number", { status: 400 });
        }

        if (stampDuty !== undefined && isNaN(Number(stampDuty))) {
            return new NextResponse("Stamp duty must be a number", { status: 400 });
        }

        const policy = await prisma.policy.update({
            where: {
                id: params.id,
            },
            data: {
                policyNo,
                clientId,
                vehicleId,
                insurerId,
                status,
                validFrom: validFrom ? new Date(validFrom) : undefined,
                validTo: validTo ? new Date(validTo) : undefined,
                premium,
                stampDuty,
                remarks,
                updatedBy: user.id,
            },
        });

        return NextResponse.json(policy);
    } catch (error) {
        console.error("Error updating policy:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const policy = await prisma.policy.update({
            where: {
                id: params.id,
            },
            data: {
                isActive: false,
                deletedAt: new Date(),
                updatedBy: user.id,
            },
        });

        return NextResponse.json(policy);
    } catch (error) {
        console.error("Error deleting policy:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 