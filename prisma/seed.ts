import { PrismaClient } from "@prisma/client";
import { Role, ClientType, PolicyStatus, StickerStatus } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Create or update a test user with hashed password
  const hashedPassword = await argon2.hash("password123");
  const user = await prisma.user.upsert({
    where: {
      email: "piira@robodog.com",
    },
    update: {
      name: "Aegis Piira",
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email: "piira@robodog.com",
      name: "Aegis Piira",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Create vehicle categories
  await prisma.vehicleCategory.createMany({
    data: [
      {
        name: "Private",
        description:
          "Owned and used by individuals for personal transportation.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Commercial",
        description:
          "Used for business purposes, such as delivery or service vehicles.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Government",
        description:
          "Owned and operated by governmental departments or agencies.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Diplomatic",
        description:
          "Assigned to diplomats, often enjoys special privileges and immunity.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Agricultural",
        description:
          "Used in farming and agricultural activities (e.g., tractors, harvesters).",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Military",
        description:
          "Operated by the armed forces, often for defense or strategic use.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "PublicService",
        description:
          "Used for transporting the public — includes buses, taxis, etc.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Rental",
        description: "Provided by car hire/rental services for temporary use.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Emergency",
        description:
          "Designed for urgent response — includes ambulances, fire trucks, etc.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create vehicle types
  await prisma.vehicleType.createMany({
    data: [
      {
        name: "Car",
        description:
          "A standard four-wheeled passenger vehicle, typically seats 4–5 people.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Motorcycle",
        description:
          "A two-wheeled motorized vehicle designed for individual or dual passengers.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Truck",
        description:
          "A larger vehicle used for transporting goods, often with higher load capacity.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Bus",
        description:
          "A large road vehicle designed to carry many passengers, typically for public transport.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Van",
        description:
          "A medium-sized vehicle, often used for transporting goods or groups of people.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Tractor",
        description:
          "A powerful vehicle used mainly in agriculture for pulling trailers or machinery.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Trailer",
        description:
          "A non-motorized vehicle towed by another vehicle, used to carry goods or equipment.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Forklift",
        description:
          "An industrial vehicle with a pronged device for lifting and moving materials.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Bicycle",
        description:
          "A human-powered two-wheeled vehicle, often used for personal transport.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "ATV",
        description:
          "All-Terrain Vehicle, designed for off-road use on rough terrains.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create vehicle body types
  await prisma.vehicleBodyType.createMany({
    data: [
      {
        name: "Sedan",
        description:
          "A classic car shape with a separate trunk and seating for 4–5.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Hatchback",
        description:
          "A compact vehicle with a rear door that opens upwards, combining trunk and cabin.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Coupe",
        description: "A 2-door car with a sporty style, typically seats 2–4.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Convertible",
        description:
          "A car with a roof that can be folded or removed for open-air driving.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "SUV",
        description:
          "Sports Utility Vehicle — larger and often 4WD, suited for off-road and family use.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Crossover",
        description:
          "A blend of SUV and passenger car, offering comfort and utility.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Pickup",
        description:
          "A vehicle with an open cargo area at the back, often with high load capacity.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "StationWagon",
        description:
          "A car with extended rear cargo space and typically a rear hatch door.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Minivan",
        description:
          "A family-focused vehicle with sliding doors and space for 7+ passengers.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "BoxTruck",
        description:
          "A truck with an enclosed cargo area shaped like a box — used for moving goods.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Tanker",
        description:
          "A truck designed to carry liquid or gas cargo (e.g., fuel, water).",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
      {
        name: "Flatbed",
        description:
          "A truck with a flat, open cargo area used for large or heavy items.",
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      },
    ],
    skipDuplicates: true,
  });

  // Fetch all created records
  const [categories, vehicleTypes, bodyTypes] = await Promise.all([
    prisma.vehicleCategory.findMany(),
    prisma.vehicleType.findMany(),
    prisma.vehicleBodyType.findMany(),
  ]);

  console.log("Categories:", categories);
  console.log("Vehicle Types:", vehicleTypes);
  console.log("Body Types:", bodyTypes);

  // Check if we have the required records
  if (!categories.length || !vehicleTypes.length || !bodyTypes.length) {
    throw new Error("Required vehicle types, categories, or body types are missing");
  }

  // Create or update a test client
  const client = await prisma.client.upsert({
    where: {
      email: "piira@robodog.com",
    },
    update: {
      name: "Aegis Piira",
      phone: "+1234567890",
      address: "123 Test St",
      type: ClientType.INDIVIDUAL,
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
    create: {
      name: "Aegis Piira",
      email: "piira@robodog.com",
      phone: "+1234567890",
      address: "123 Test St",
      type: ClientType.INDIVIDUAL,
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create test vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNo: "ABC123",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      chassisNumber: "CH123456",
      engineNumber: "EN123456",
      bodyTypeId: bodyTypes[0].id,
      categoryId: categories[0].id,
      clientId: client.id,
      vehicleTypeId: vehicleTypes[0].id,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create insurer
  const insurer = await prisma.insurer.create({
    data: {
      name: "Sample Insurance Company",
      email: "sample@insurer.com",
      phone: "+1234567890",
      address: "123 Test St",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create policy with insurer
  const policy = await prisma.policy.create({
    data: {
      policyNo: "POL001",
      clientId: client.id,
      status: PolicyStatus.ACTIVE,
      insurerId: insurer.id,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      premium: 1000,
      stampDuty: 50,
      remarks: "Test policy",
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create a sticker type
  const stickerType = await prisma.stickerType.create({
    data: {
      name: "Standard Insurance Sticker",
      description: "Standard insurance sticker for vehicles",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create sticker stock
  const stickerStock = await prisma.stickerStock.create({
    data: {
      serialNumber: "STICKER001",
      stickerTypeId: stickerType.id,
      stickerStatus: StickerStatus.AVAILABLE,
      receivedAt: new Date(),
      insurerId: insurer.id,
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create StickerIssuance
  const stickerIssuance = await prisma.stickerIssuance.create({
    data: {
      policyId: policy.id,
      vehicleId: vehicle.id,
      issuedAt: new Date(),
      issuedBy: user.id,
      createdBy: user.id,
      updatedBy: user.id,
      stockId: stickerStock.id,
      stickerTypeId: stickerType.id,
    },
  });

  // Update sticker stock to mark as issued
  await prisma.stickerStock.update({
    where: { id: stickerStock.id },
    data: {
      stickerStatus: StickerStatus.ISSUED,
      updatedBy: user.id,
    },
  });

  console.log({
    user: { id: user.id, email: user.email },
    client: { id: client.id, name: client.name },
    vehicle: { id: vehicle.id, registrationNo: vehicle.registrationNo },
    policy: { id: policy.id, policyNo: policy.policyNo },
    stickerIssuance: { id: stickerIssuance.id },
    stickerStock: {
      id: stickerStock.id,
      serialNumber: stickerStock.serialNumber,
    },
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    vehicleTypes: vehicleTypes.map((vt) => ({ id: vt.id, name: vt.name })),
    bodyTypes: bodyTypes.map((bt) => ({ id: bt.id, name: bt.name })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
