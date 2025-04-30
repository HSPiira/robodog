import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

// Define the type for vehicle creation input
type VehicleCreateData = {
  registrationNo: string;
  make: string;
  model: string;
  year: number;
  bodyTypeId: string;
  categoryId: string;
  vehicleTypeId: string;
  clientId: string;
  chassisNumber: string;
  engineNumber: string;
  seatingCapacity: number | null;
  cubicCapacity: number | null;
  grossWeight: number | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
};

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const body = await request.json();
    const {
      registrationNo,
      make,
      model,
      year,
      bodyTypeId,
      categoryId,
      vehicleTypeId,
      clientId,
      chassisNumber,
      engineNumber,
      seatingCapacity,
      cubicCapacity,
      grossWeight,
    } = body;

    // Validate required fields
    if (
      !registrationNo ||
      !make ||
      !model ||
      !bodyTypeId ||
      !categoryId ||
      !clientId ||
      !chassisNumber ||
      !engineNumber
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { error: `Client with ID ${clientId} not found` },
        { status: 404 }
      );
    }

    // Check if vehicle with same registration number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNo: registrationNo.toUpperCase() },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "A vehicle with this registration number already exists" },
        { status: 409 }
      );
    }

    // Verify user exists in the database and get their ID
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

    // Create the vehicle data
    /*
     * IMPORTANT: Better approach would be to run:
     * npx prisma generate
     *
     * Then use the proper Prisma types directly instead of casting to 'any'.
     * This would provide full type safety for your database operations.
     */
    const vehicleData = {
      registrationNo: registrationNo.toUpperCase(),
      make,
      model,
      year,
      bodyTypeId,
      categoryId,
      vehicleTypeId,
      clientId,
      chassisNumber,
      engineNumber,
      seatingCapacity: seatingCapacity || null,
      cubicCapacity: cubicCapacity || null,
      grossWeight: grossWeight || null,
      isActive: true,
      createdBy: dbUser.id,
      updatedBy: dbUser.id,
    };

    // We're using 'as any' temporarily - run 'npx prisma generate'
    // and update your code to use proper typing instead
    const vehicle = await prisma.vehicle.create({
      data: vehicleData as any, // TODO: Replace with proper typing
      include: {
        bodyType: true,
        vehicleCategory: true,
        vehicleType: true,
        client: true,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle" },
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

    const { searchParams } = new URL(request.url);

    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        registrationNo: "asc",
      },
      include: {
        bodyType: {
          select: {
            name: true,
          },
        },
        vehicleCategory: {
          select: {
            name: true,
          },
        },
        vehicleType: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            policies: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const formattedVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      registrationNo: vehicle.registrationNo,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      chassisNumber: vehicle.chassisNumber,
      engineNumber: vehicle.engineNumber,
      bodyType: vehicle.bodyType,
      vehicleCategory: vehicle.vehicleCategory,
      vehicleType: vehicle.vehicleType,
      client: vehicle.client,
      isActive: vehicle.isActive,
      policies: vehicle._count.policies,
      seatingCapacity: vehicle.seatingCapacity,
      grossWeight: vehicle.grossWeight,
      cubicCapacity: vehicle.cubicCapacity,
    }));

    return NextResponse.json(formattedVehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
