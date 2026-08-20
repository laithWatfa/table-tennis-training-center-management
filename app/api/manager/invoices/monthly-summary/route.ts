import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
const session = await auth();

if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

try {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get("monthStr"); // 1-indexed (1 = Jan, 12 = Dec)

    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;

    if (monthStr && monthStr.includes("-")) {
        const [yearPart, monthPart] = monthStr.split("-");
        year = Number(yearPart);
        month = Number(monthPart);
        }

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "تاريخ غير صالح" }, { status: 400 });
    }
    // 2. Compute calendar range thresholds (handling safe month transitions natively)
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Day 0 gets the last day of the previous month

    // 3. Run aggregated queries inside the database engine simultaneously
    const [paidAggregation, unpaidAggregation] = await Promise.all([
    prisma.invoice.aggregate({
        where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "PAID",
        },
        _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
        where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "UNPAID",
        },
        _sum: { amount: true },
    }),
    ]);

    // 4. Fallback missing parameters to zero if no entries exist for that timeframe
    const paid = paidAggregation._sum.amount || 0;
    const unpaid = unpaidAggregation._sum.amount || 0;
    const total = paid + unpaid;

    // 5. Return the exact JSON structure required
    return NextResponse.json({
    total,
    paid,
    unpaid,
    });

} catch (error) {
    console.error("Monthly aggregate extraction failure:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
}
}
