import { prisma } from "@/lib/prisma";
import * as argon2 from "argon2";
import { Prisma } from "@prisma/client";

export interface UserCreateInput {
    email: string;
    name: string;
    password: string;
    role: string;
    isActive?: boolean;
}

export interface UserUpdateInput {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
}

export class UserService {
    /**
     * Get all active users
     */
    static async getAllUsers() {
        return prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Get a user by ID
     */
    static async getUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Get a user by email
     */
    static async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Create a new user
     */
    static async createUser(data: UserCreateInput) {
        const hashedPassword = await argon2.hash(data.password);

        return prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: data.role,
                isActive: data.isActive ?? true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Update a user
     */
    static async updateUser(id: string, data: UserUpdateInput) {
        const updateData: any = { ...data };

        // Hash password if provided
        if (data.password) {
            updateData.password = await argon2.hash(data.password);
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Soft delete a user
     */
    static async deleteUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }

    /**
     * Verify user credentials
     */
    static async verifyCredentials(email: string, password: string) {
        try {
            const user = await this.getUserByEmail(email);

            if (!user) {
                return null;
            }

            try {
                const isPasswordValid = await argon2.verify(user.password, password);

                if (!isPasswordValid) {
                    return null;
                }

                return user;
            } catch (error) {
                console.error('Password verification error:', error);
                throw new Error('Password verification failed');
            }
        } catch (error) {
            console.error('Database error during credential verification:', error);
            if (error instanceof Prisma.PrismaClientInitializationError) {
                throw new Error('Database connection error');
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new Error('Database error');
            }
            if (error instanceof Prisma.PrismaClientRustPanicError) {
                throw new Error('Critical database error');
            }
            throw error;
        }
    }
} 