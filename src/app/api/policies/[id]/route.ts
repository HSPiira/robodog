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
                insurer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!policy) {
            return new NextResponse("Policy not found", { status: 404 });
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
            insurerId,
            status,
            validFrom,
            validTo,
            premium,
            stampDuty,
            remarks,
        } = body;

        if (!policyNo || !clientId || !insurerId || !validFrom || !validTo || !status) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const policy = await prisma.policy.update({
            where: { id: params.id },
            data: {
                policyNo,
                clientId,
                insurerId,
                status,
                validFrom: new Date(validFrom),
                validTo: new Date(validTo),
                premium: premium ? Number(premium) : null,
                stampDuty: stampDuty ? Number(stampDuty) : null,
                remarks,
                updatedBy: user.id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
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