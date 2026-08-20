import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
// 1. Guard check: Verify manager role permissions
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") { 
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

try {
    const { searchParams } = new URL(request.url);

    const sundayParam = searchParams.get("sundayDate"); // Expected format: YYYY-MM-DD

    if (!sundayParam) {
    return NextResponse.json({ error: "يرجى تحديد تاريخ يوم الأحد" }, { status: 400 });
    }

    // 2. Set the exact start time to the beginning of Sunday (00:00:00)
    const startDate = new Date(sundayParam);
    startDate.setHours(0, 0, 0, 0);

    // 3. Compute the end date (Saturday at 23:59:59.999). Adding 6 days to Sunday gets us to Saturday.
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // 4. Query Prisma using range filters
    const reservations = await prisma.reservation.findMany({
    where: {
        date: {
        gte: startDate,
        lte: endDate,
        },
        table: Number.parseInt(searchParams.get("table") ?? "1") 
    },
    orderBy: [
        { date: "asc" },
        { startHour: "asc" }
    ],
    include: {
        user: {
        select: { fullName: true, email: true }
        },
        invoice: {
        select: { amount: true, status: true , id: true}
        },
        planVariant: {
        select: { displayName: true } 
        }
    }
    });

    return NextResponse.json({
    reservations,
    meta: {
        weekStart: startDate.toISOString().split('T')[0],
        weekEnd: endDate.toISOString().split('T')[0],
        totalReservations: reservations.length
    }
    });

} catch (error) {
    console.error("Fetch Weekly Reservations Error:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
}
}
