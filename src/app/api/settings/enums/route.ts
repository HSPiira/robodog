import { NextResponse } from 'next/server';
import { AllEnums, isDatabaseEnum, validateEnumValue, updateDatabaseEnumValue } from '@/lib/services/enums';

export async function GET() {
    return NextResponse.json(AllEnums);
}

export async function PUT(request: Request) {
    try {
        const { enumGroup, key, value } = await request.json();

        if (!enumGroup || !key || !value) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Handle database enums
        if (isDatabaseEnum(enumGroup)) {
            const validation = await validateEnumValue(enumGroup, value);
            if (!validation.isValid) {
                return NextResponse.json(
                    { error: validation.error || 'Invalid enum value' },
                    { status: 400 }
                );
            }

            const result = await updateDatabaseEnumValue(enumGroup, key, value);
            if (!result.success) {
                return NextResponse.json(
                    { error: result.error || 'Failed to update database enum' },
                    { status: 500 }
                );
            }
        }

        // Update the enum in our store
        const updatedEnum = { ...AllEnums[enumGroup as keyof typeof AllEnums] };
        (updatedEnum as any)[key] = value;
        (AllEnums as any)[enumGroup] = updatedEnum;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update enum' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { enumGroup, key, value } = await request.json();

        if (!enumGroup || !key || !value) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Handle database enums
        if (isDatabaseEnum(enumGroup)) {
            const validation = await validateEnumValue(enumGroup, value);
            if (!validation.isValid) {
                return NextResponse.json(
                    { error: validation.error || 'Invalid enum value' },
                    { status: 400 }
                );
            }
        }

        // Add the new enum value to our store
        const updatedEnum = { ...AllEnums[enumGroup as keyof typeof AllEnums] };
        (updatedEnum as any)[key] = value;
        (AllEnums as any)[enumGroup] = updatedEnum;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to add enum value' },
            { status: 500 }
        );
    }
} 