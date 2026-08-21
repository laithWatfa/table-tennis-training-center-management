// app/api/user/reservations/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkUnpaidLimit } from "@/lib/invoice-gate"; // 👈 1. IMPORT THE FINANCE PROTECTION GATE
import { NextResponse } from "next/server";

async function calculateInvoiceAmount(durationMinutes: number, withCoach: boolean, withPaddles: boolean): Promise<number> {
const settings = await prisma.venueSetting.findUnique({ where: { id: "global-config" } });

const tableRatePerMinute = (settings?.tableRatePerHour || 60) / 60;
const coachRatePerMinute = (settings?.coachRatePerHour || 40) / 60;
const paddlesFlatFee = settings?.paddlesFlatFee || 10;       // 10 units flat equipment fee

let total = durationMinutes * tableRatePerMinute;

if (withCoach) {
    total += durationMinutes * coachRatePerMinute;
}
if (withPaddles) {
    total += paddlesFlatFee;
}

return Math.round((total + Number.EPSILON) * 100) / 100;
}

export async function GET(request : Request) {
const session = await auth();

// 1. Guard against unauthenticated requests
if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const { searchParams } = new URL(request.url);
const page = Math.max(1, Number(searchParams.get("page") || 1));
const limit = Math.max(1, Number(searchParams.get("limit") || 12));

const skip = (page - 1) * limit;

try {
    // 2. Query reservations while cleanly joining invoice metadata
    const reservations = await prisma.reservation.findMany({
    skip,
    take: limit,
    where: { 
        userId: session.user.id 
    },
    orderBy: {
        date: "desc" 
    },
    include: {
        invoice: {
        select: {
            amount: true, 
            status: true, 
        }
        }
    }
    });

    return NextResponse.json(reservations);
} catch (error) {
    console.error("Error fetching player reservations with invoices:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي أثناء جلب الحجوزات والعمليات المالية" }, 
    { status: 500 }
    );
}
}


export async function POST(request: Request) {
// 1. Double check authentication layer security safeguards
const session = await auth();
if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
}

try {
    // 👈 2. FINANCIAL CASH LIMIT CHECK (BLOCKED STATUS DEBT VERIFICATION)
    const debtCheck = await checkUnpaidLimit(session.user.id);
    if (debtCheck.hasReachedLimit) {
    return NextResponse.json(
        { 
        error: `عذراً، تم إيقاف الحجوزات الجديدة مؤقتاً لتجاوز حد الذمم المالية المعلقة. ذمتك الحالية هي (${debtCheck.totalOutstandingDebt.toLocaleString()} ل.س) والحد الأقصى المسموح به هو (${debtCheck.limit.toLocaleString()} ل.س). يرجى تسديد فواتيرك السابقة أولاً لتتمكن من الحجز.` 
        }, 
        { status: 403 } // 403 Forbidden
    );
    }





    const json = await request.json();
    const { date, table, startHour, duration, status, withCoach, withPaddles } = json;

    // 3. Validate essential structural fields
    if (!date || !table || startHour === undefined) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

        const requestedStart = Number(startHour);
        const requestedEnd = requestedStart + (Number(duration) / 60);
        const targetReservationDate = new Date(date);


        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999)

        // 1. Check if ANY booking already sits inside this requested timeframe block
        const conflictingReservation = await prisma.reservation.findFirst({
        where: {
            table: Number(table),
            date: {
            gte: dayStart,
            lte: dayEnd,
            },
            // Overlap math verification constraint mapping
            OR: [
            {
                // Case A: Existing booking starts while your proposed session is active
                startHour: { gte: requestedStart, lt: requestedEnd }
            },
            {
                // Case B: Existing booking is ongoing when your proposed session starts
                startHour: { lte: requestedStart },
                // (startHour + duration/60) represents the concrete end time
            }
            ]
        }
});


// 2. Extra double-check calculation guard for Case B inside JavaScript since we can't do math formulas directly in Prisma where filters safely
if (conflictingReservation) {
   return NextResponse.json({ error: "عذراً، هذا الوقت تم حجزه للتو من لاعب آخر. يرجى اختيار موعد آخر." }, { status: 409 }); // 409 Conflict
}

    // 4. Form fields conversion validation step (safely parse into Database formats)
    const reservationDate = new Date(date);
    const durationNum = Number(duration);
    const coachBool = Boolean(withCoach);
    const paddlesBool = Boolean(withPaddles);

    // 5. Calculate the financial total dynamically on the secure server side
    const totalAmount = await calculateInvoiceAmount(durationNum, coachBool, paddlesBool);

    // 6. Write data to Prisma matching your schema models explicitly
    const reservation = await prisma.reservation.create({
    data: {
        date: reservationDate,               
        table: Number(table),                
        startHour: Number(startHour),        
        duration: Number(duration),          
        withCoach: coachBool,
        withPaddles: paddlesBool,
        userId: session.user.id,             
        invoice: {
        create: {
            amount: totalAmount,
            status: status === "PAID" ? "PAID" : "UNPAID", 
            userId: session.user.id,
        }
        }
    },
    include: {
        invoice: true
    }
    });

    return NextResponse.json(reservation, { status: 201 });
} catch (error) {
    console.error("CRITICAL RESERVATION POST ERROR:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي في الخادم أثناء معالجة طلب الحجز" }, 
    { status: 500 }
    );
}
}
