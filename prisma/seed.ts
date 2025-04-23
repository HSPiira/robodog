import {
  PrismaClient,
  UsageType,
  PolicyStatus,
  ClientType,
  StickerStatus,
} from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Create a test user with hashed password
  const hashedPassword = await argon2.hash("password123");
  const user = await prisma.user.create({
    data: {
      email: "piira@robodog.com",
      name: "Henry Piira",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Create a test client
  const client = await prisma.client.create({
    data: {
      name: "Henry Piira",
      email: "piira@robodog.com",
      phone: "+1234567890",
      address: "123 Test St",
      type: ClientType.INDIVIDUAL,
      isActive: true,
    },
  });

  // Create a test body type
  const bodyType = await prisma.bodyType.create({
    data: {
      name: "Sedan",
      isActive: true,
    },
  });

  // Create a test vehicle category
  const category = await prisma.vehicleCategory.create({
    data: {
      name: "Light Vehicle",
      isActive: true,
    },
  });

  // Create a test vehicle type
  const vehicleType = await prisma.vehicleType.create({
    data: {
      id: "PASSENGER",
      name: "Passenger Vehicle",
      isActive: true,
    },
  });

  // Create a test vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNo: "ABC123",
      make: "Toyota",
      model: "Corolla",
      year: 2023,
      chassisNumber: "CHASSIS123",
      engineNumber: "ENGINE123",
      bodyTypeId: bodyType.id,
      categoryId: category.id,
      vehicleTypeId: vehicleType.id,
      clientId: client.id,
      seatingCapacity: 5,
      grossWeight: 1500,
      cubicCapacity: 1800,
      isActive: true,
    },
  });

  // Create a test issuing company
  const issuingCompany = await prisma.issuingCompany.create({
    data: {
      name: "Test Insurance Co",
      code: "TIC",
      isActive: true,
    },
  });

  // Create a test policy
  const policy = await prisma.policy.create({
    data: {
      certificateNo: "CERT123",
      policyNo: "POL123",
      clientId: client.id,
      vehicleId: vehicle.id,
      usage: UsageType.PRIVATE,
      status: PolicyStatus.ACTIVE,
      issuingCompanyId: issuingCompany.id,
      issuingOfficerId: user.id,
      issuedAt: new Date(),
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      branch: "Main Branch",
      premium: 1000,
      stampDuty: 50,
      stickerFee: 25,
      receiptNumber: "REC123",
      isActive: true,
    },
  });

  // Create a test sticker
  const sticker = await prisma.sticker.create({
    data: {
      stickerNo: "STK123",
      policyId: policy.id,
      vehicleId: vehicle.id,
      isActive: true,
      status: "Issued",
      issuedAt: new Date(),
      issuedBy: user.id,
    },
  });

  console.log({ client, vehicle, policy, sticker });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
