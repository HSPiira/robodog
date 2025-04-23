import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface RouteContext {
    params: {
        id: string;
    };
}

export async function PATCH(req: Request, context: RouteContext) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = context.params;
        const body = await req.json();
        const { isActive } = body;

        if (typeof isActive !== "boolean") {
            return new NextResponse("Invalid request body", { status: 400 });
        }

        const insurer = await db.insurer.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json(insurer);
    } catch (error) {
        console.error("[INSURER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = context.params;

        await db.insurer.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[INSURER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 