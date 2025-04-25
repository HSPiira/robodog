import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type InsurerCreateInput = Prisma.InsurerCreateInput;
export type InsurerUpdateInput = Prisma.InsurerUpdateInput;
export type InsurerWhereInput = Prisma.InsurerWhereInput;
export type InsurerWhereUniqueInput = Prisma.InsurerWhereUniqueInput;
export type InsurerSelect = Prisma.InsurerSelect;
export type InsurerInclude = Prisma.InsurerInclude;

export class InsurerService {
    static async create(data: InsurerCreateInput) {
        return prisma.insurer.create({
            data,
        });
    }

    static async findMany(params: {
        skip?: number;
        take?: number;
        where?: InsurerWhereInput;
        orderBy?: Prisma.InsurerOrderByWithRelationInput;
        select?: InsurerSelect;
        include?: InsurerInclude;
    }) {
        const { skip, take, where = {}, orderBy, select, include } = params;
        const effectiveWhere = { ...where, deletedAt: null };

        return prisma.insurer.findMany({
            skip,
            take,
            where: effectiveWhere,
            orderBy,
            ...(select ? { select } : {}),
            ...(include ? { include } : {}),
        });
    }

    static async findManyIncludingDeleted(params: {
        skip?: number;
        take?: number;
        where?: InsurerWhereInput;
        orderBy?: Prisma.InsurerOrderByWithRelationInput;
        select?: InsurerSelect;
        include?: InsurerInclude;
    }) {
        const { skip, take, where, orderBy, select, include } = params;
        return prisma.insurer.findMany({
            skip,
            take,
            where,
            orderBy,
            ...(select ? { select } : {}),
            ...(include ? { include } : {}),
        });
    }

    static async findUnique(params: {
        where: InsurerWhereUniqueInput;
        select?: InsurerSelect;
        include?: InsurerInclude;
    }) {
        const { where, select, include } = params;
        return prisma.insurer.findUnique({
            where,
            ...(select ? { select } : {}),
            ...(include ? { include } : {}),
        });
    }

    static async update(params: {
        where: InsurerWhereUniqueInput;
        data: InsurerUpdateInput;
        select?: InsurerSelect;
        include?: InsurerInclude;
    }) {
        const { where, data, select, include } = params;
        return prisma.insurer.update({
            where,
            data,
            ...(select ? { select } : {}),
            ...(include ? { include } : {}),
        });
    }

    static async delete(params: {
        where: InsurerWhereUniqueInput;
        select?: InsurerSelect;
        include?: InsurerInclude;
    }) {
        const { where, select, include } = params;
        return prisma.insurer.delete({
            where,
            ...(select ? { select } : {}),
            ...(include ? { include } : {}),
        });
    }

    static async softDelete(params: {
        where: InsurerWhereUniqueInput;
        select?: InsurerSelect;
        include?: InsurerInclude;
    }) {
        const { where, select, include } = params;
        return prisma.insurer.update({
            where,
            data: {
                deletedAt: new Date(),
            },
            ...(select ? { select } : {}),
            ...(include ? { include } : {}),
        });
    }
} 