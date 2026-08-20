// app/api/manager/reservations/new/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkUnpaidLimit } from "@/lib/invoice-gate";
import { NextResponse } from "next/server";

async function  calculateInvoiceAmount(durationMinutes: number, withCoach: boolean, withPaddles: boolean): number {
const settings = await prisma.venueSetting.findUnique({ where: { id: "global-config" } });

const tableRatePerMinute = (settings?.tableRatePerHour || 6000) / 60;
const coachRatePerMinute = (settings?.coachRatePerHour || 12000) / 60;
const paddlesFlatFee = settings?.paddlesFlatFee || 1000;      

let total = durationMinutes * tableRatePerMinute;
if (withCoach) total += durationMinutes * coachRatePerMinute;
if (withPaddles) total += paddlesFlatFee;

return Math.round((total + Number.EPSILON) * 100) / 100;
}

export async function POST(request: Request) {
const session = await auth();
if (!session?.user?.id || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 401 });
}

try {
    const json = await request.json();
    const { date, table, startHour, duration, status, withCoach, withPaddles, userID, force } = json;

    const settings = await prisma.venueSetting.findUnique({
    where: { id: "global-config" }
    });

    const maxTablesAllowed = settings?.totalTables || 4; // Fallback to 4 if row missing

    // 2. Add an explicit logical gate check before database creation
    if (Number(table) > maxTablesAllowed || Number(table) < 1) {
    return NextResponse.json({ 
        error: `رقم الطاولة المحدد غير صالح. الحد الأقصى المتاح حالياً هو طاولات: ${maxTablesAllowed}` 
    }, { status: 400 });
    }

    if (!date || !table || startHour === undefined || !userID) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    // 👈 FINANCIAL LIMIT EVALUATION TRIGGER
    const debtCheck = await checkUnpaidLimit(String(userID));
    
    // If they hit the ceiling, and the manager hasn't explicitly clicked override yet:
    if (debtCheck.hasReachedLimit && !force) {
    return NextResponse.json({
        hasExceededLimit: true,
        currentDebt: debtCheck.totalOutstandingDebt,
        allowedLimit: debtCheck.limit,
        error: `اللاعب تجاوز الحد المسموح به للذمم المعلقة (${debtCheck.totalOutstandingDebt.toLocaleString()} ل.س).`
    }, { status: 200 }); // Status 200 so the frontend catch doesn't think it's a network drop
    }

    const reservationDate = new Date(date);
    const totalAmount = await calculateInvoiceAmount(Number(duration), Boolean(withCoach), Boolean(withPaddles));

    const reservation = await prisma.reservation.create({
    data: {
        date: reservationDate,               
        table: Number(table),                
        startHour: Number(startHour),        
        duration: Number(duration),          
        withCoach: Boolean(withCoach),
        withPaddles: Boolean(withPaddles),
        userId: String(userID),     
        invoice: {
        create: {
            amount: totalAmount,
            status: status === "PAID" ? "PAID" : "UNPAID", 
            paidAt: status === "PAID" ? new Date() : null, 
            userId: String(userID),
        }
        }
    },
    include: { invoice: true }
    });

    return NextResponse.json({ success: true, reservation }, { status: 201 });
} catch (error) {
    console.error("ADMIN RESERVATION POST ERROR:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
}
}
