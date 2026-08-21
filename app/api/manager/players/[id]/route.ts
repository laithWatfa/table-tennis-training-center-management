// app/api/manager/players/[id]/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    const {id} = await params;
    const targetPlayer = await prisma.user.findUnique({
    where: { id: id },
    select: {
        fullName: true,
        email: true,
        role: true,
        dateOfBirth: true,
        invoices: {
        select: { id: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" }
        },
        reservations: {
        select: { id: true, date: true, startHour: true, duration: true, table: true },
        orderBy: { date: "desc" },
        take: 20 // Limit to last 20 bookings to avoid data bloat
        }
    }
    });

    if (!targetPlayer) {
    return NextResponse.json({ error: "اللاعب المحدد غير موجود" }, { status: 404 });
    }

    return NextResponse.json(targetPlayer);
} catch (error) {
    console.error("INDIVIDUAL PROFILE QUERY CRASH:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
}
}
