import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PolicyStatus } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const policies = await prisma.policy.findMany({
            where: {
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
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(policies);
    } catch (error) {
        console.error("Error fetching policies:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(request: Request) {
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
            validFrom,
            validTo,
            premium,
            stampDuty,
            remarks,
        } = body;

        if (!policyNo || !clientId || !vehicleId || !insurerId || !validFrom || !validTo) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const policy = await prisma.policy.create({
            data: {
                policyNo,
                clientId,
                vehicleId,
                insurerId,
                status: PolicyStatus.ACTIVE,
                validFrom: new Date(validFrom),
                validTo: new Date(validTo),
                premium,
                stampDuty,
                remarks,
                createdBy: user.id,
                updatedBy: user.id,
            },
        });

        return NextResponse.json(policy);
    } catch (error) {
        console.error("Error creating policy:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 