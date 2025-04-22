import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET a single vehicle by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        bodyType: {
          select: {
            id: true,
            name: true,
          },
        },
        vehicleCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        vehicleType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

// PATCH to update a vehicle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();

    // Extract fields from the body
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

    // Check if the vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // If registration number is being updated, check for duplicates
    if (registrationNo && registrationNo !== existingVehicle.registrationNo) {
      const formattedRegNo = registrationNo.toUpperCase();

      // Check if another vehicle with the same registration number already exists
      const duplicateVehicle = await prisma.vehicle.findFirst({
        where: {
          registrationNo: formattedRegNo,
          id: { not: id }, // Exclude the current vehicle
        },
      });

      if (duplicateVehicle) {
        return NextResponse.json(
          { error: "A vehicle with this registration number already exists" },
          { status: 409 }
        );
      }
    }

    // Get user ID for audit trail
    const user = session.user as { id?: string; email: string };
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

    // Update the vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        registrationNo: registrationNo ? registrationNo.toUpperCase() : undefined,
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
        updatedBy: dbUser.id,
      },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { policies: true },
        },
      },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Check if vehicle has policies
    if (existingVehicle._count.policies > 0) {
      return NextResponse.json(
        { error: "Cannot delete vehicle with active policies" },
        { status: 400 }
      );
    }

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
