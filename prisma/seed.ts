const { PrismaClient } = require('@prisma/client')
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
      type: "INDIVIDUAL",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create a test body type
  const bodyType = await prisma.bodyType.create({
    data: {
      name: "Sedan",
      description: "Standard sedan body type",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create a test vehicle category
  const category = await prisma.vehicleCategory.create({
    data: {
      name: "Light Vehicle",
      description: "Light passenger vehicles",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create a test vehicle type
  const vehicleType = await prisma.vehicleType.create({
    data: {
      name: "Passenger Vehicle",
      description: "Standard passenger vehicle type",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
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
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create insurer
  const insurer = await prisma.insurer.create({
    data: {
      name: "Sample Insurance Company",
      address: "123 Insurance Street",
      email: "contact@sampleinsurance.com",
      phone: "+1234567890",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  // Create policy with insurer
  const policy = await prisma.policy.create({
    data: {
      certificateNo: "CERT001",
      policyNo: "POL001",
      clientId: client.id,
      vehicleId: vehicle.id,
      usage: "PRIVATE",
      status: "ACTIVE",
      insurerId: insurer.id,
      issuingOfficerId: user.id,
      issuedAt: new Date(),
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      branch: "Main Branch",
      premium: 1000,
      stampDuty: 50,
      stickerFee: 25,
      receiptNumber: "REC001",
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
      stickerStatus: "AVAILABLE",
      receivedAt: new Date(),
      insurerId: insurer.id,
      isIssued: false,
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
      isIssued: true,
      stickerStatus: "ISSUED",
      updatedBy: user.id,
    },
  });

  console.log({
    user: { id: user.id, email: user.email },
    client: { id: client.id, name: client.name },
    vehicle: { id: vehicle.id, registrationNo: vehicle.registrationNo },
    policy: { id: policy.id, policyNo: policy.policyNo },
    stickerIssuance: { id: stickerIssuance.id },
    stickerStock: { id: stickerStock.id, serialNumber: stickerStock.serialNumber }
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
