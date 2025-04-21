import { UserRole, NotificationType, Theme, Language, PrivacyLevel, AccountStatus } from '@/lib/enums';
import { PolicyStatus, UsageType, CustomerType, VehicleType } from '@prisma/client';
import { Prisma } from '@prisma/client';

// Application enums
export const ApplicationEnums = {
    UserRole,
    NotificationType,
    Theme,
    Language,
    PrivacyLevel,
    AccountStatus,
} as const;

// Database (Prisma) enums
export const DatabaseEnums = {
    PolicyStatus,
    UsageType,
    CustomerType,
    VehicleType: {
        PASSENGER: 'PASSENGER',
        COMMERCIAL: 'COMMERCIAL',
        MOTORCYCLE: 'MOTORCYCLE',
        OTHER: 'OTHER',
    },
} as const;

// Combined enums for management
export const AllEnums = {
    ...ApplicationEnums,
    ...DatabaseEnums,
} as const;

// Type for enum categories
export type EnumCategory = 'APPLICATION' | 'DATABASE';

// Mapping of enum names to their categories
export const enumCategories: Record<keyof typeof AllEnums, EnumCategory> = {
    // Application enums
    UserRole: 'APPLICATION',
    NotificationType: 'APPLICATION',
    Theme: 'APPLICATION',
    Language: 'APPLICATION',
    PrivacyLevel: 'APPLICATION',
    AccountStatus: 'APPLICATION',

    // Database enums
    PolicyStatus: 'DATABASE',
    UsageType: 'DATABASE',
    CustomerType: 'DATABASE',
    VehicleType: 'DATABASE',
};

// Mapping of enum names to their related database tables
export const enumTableMapping: Record<keyof typeof DatabaseEnums, string[]> = {
    PolicyStatus: ['Policy'],
    UsageType: ['Policy'],
    CustomerType: ['Customer'],
    VehicleType: ['Vehicle'],
};

// Helper function to get all values of an enum
export function getEnumValues(enumObj: any): string[] {
    return Object.keys(enumObj).filter(key => isNaN(Number(key)));
}

// Helper function to check if an enum is a database enum
export function isDatabaseEnum(enumName: string): boolean {
    return enumCategories[enumName as keyof typeof AllEnums] === 'DATABASE';
}

// Helper function to get related tables for an enum
export function getRelatedTables(enumName: string): string[] {
    if (!isDatabaseEnum(enumName)) return [];
    return enumTableMapping[enumName as keyof typeof DatabaseEnums] || [];
}

// Helper function to validate enum value against database constraints
export async function validateEnumValue(
    enumName: string,
    value: string
): Promise<{ isValid: boolean; error?: string }> {
    // Here you would implement validation logic
    // For example, check if the value is used in any related tables
    // This is a placeholder implementation
    return { isValid: true };
}

// Helper function to update enum value in database
export async function updateDatabaseEnumValue(
    enumName: string,
    oldValue: string,
    newValue: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Here you would implement the database update logic
        // This would involve:
        // 1. Creating a new enum value
        // 2. Updating all references in related tables
        // 3. Removing the old enum value
        // This is a placeholder implementation
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update enum value in database' };
    }
} 