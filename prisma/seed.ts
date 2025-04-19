import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    // Create a test user with hashed password
    const hashedPassword = await argon2.hash('password123');
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    // Create a test customer
    const customer = await prisma.customer.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            address: '123 Main St',
        },
    });

    // Create vehicle category
    const category = await prisma.vehicleCategory.create({
        data: {
            name: 'Sedan',
        },
    });

    // Create body type
    const bodyType = await prisma.bodyType.create({
        data: {
            name: 'Four Door',
        },
    });

    // Create vehicle type
    const vehicleType = await prisma.vehicleType.create({
        data: {
            name: 'Private Car',
        },
    });

    // Create a test vehicle
    const vehicle = await prisma.vehicle.create({
        data: {
            registrationNo: 'ABC123',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            chassisNo: 'CHASSIS123',
            engineNo: 'ENGINE123',
            bodyTypeId: bodyType.id,
            categoryId: category.id,
            customerId: customer.id,
            engineNumber: 'ENGINE123',
            chassisNumber: 'CHASSIS123',
            vehicleTypeId: vehicleType.id,
            cubicCapacity: 2000,
            seatingCapacity: 5,
            grossWeight: 1500,
        },
    });

    // Create issuing company
    const issuingCompany = await prisma.issuingCompany.create({
        data: {
            name: 'Insurance Co Ltd',
            code: 'ICL',
        },
    });

    // Create a test policy
    const policy = await prisma.policy.create({
        data: {
            certificateNo: 'CERT123',
            policyNo: 'POL123',
            customerId: customer.id,
            vehicleId: vehicle.id,
            usage: 'PRIVATE',
            status: 'ACTIVE',
            issuingCompanyId: issuingCompany.id,
            issuingOfficerId: user.id,
            issuedAt: new Date(),
            validFrom: new Date(),
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            branch: 'Main Branch',
            premium: 1000,
            stampDuty: 50,
            stickerFee: 25,
            receiptNumber: 'REC123',
        },
    });

    // Create a test sticker
    const sticker = await prisma.sticker.create({
        data: {
            stickerNo: 'STK123',
            policyId: policy.id,
            bureau: 'Main Bureau',
            fromComesa: new Date(),
            toComesa: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            vehicleId: vehicle.id,
        },
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 