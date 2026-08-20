import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { GroupSchedule, Reservation } from "@prisma/client";

// Helper function to find the calendar date of the next specific weekday
function getNextWeekdayDate(baseDate: Date, targetDayOfWeek: number): Date {
const resultDate = new Date(baseDate);
const currentDayOfWeek = baseDate.getDay();

let daysToAdd = targetDayOfWeek - currentDayOfWeek;
if (daysToAdd <= 0) {
    daysToAdd += 7; // Move to next week's occurrence if it has already passed
}

resultDate.setDate(baseDate.getDate() + daysToAdd);
resultDate.setHours(0, 0, 0, 0); // Normalize time to midnight
return resultDate;
}

export async function PUT(
request: Request,
{ params }: { params: { id: string } }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

const data = await params
const variantId = await data.id;
const TABLES_TO_BLOCK = [1,2]; // Your center's table numbers

try {
    const json = await request.json();
    const { schedules } = json; // Expected: [{ dayOfWeek: 0, startHour: 16.5, duration: 60 }]

    if (!Array.isArray(schedules)) {
    return NextResponse.json({ error: "بيانات المواعيد غير صالحة" }, { status: 400 });
    }

    // Run the operation within an atomic database transaction
    await prisma.$transaction(async (tx) => {
    
    // 1. Fetch variant data to ensure it exists
    const variantData = await tx.planVariant.findUnique({
        where: { id: variantId }
    });

    if (!variantData) {
        throw new Error("باقة المجموعة غير موجودة");
    }

    // 2. Wipe old baseline schedule template configurations
    await tx.groupSchedule.deleteMany({
        where: { planVariantId: variantId },
    });

    // 3. Wipe any existing FUTURE system-generated reservations for this specific variant
    // We look for invoiceId placeholders matching a variant naming pattern to isolate them safely
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    await tx.reservation.deleteMany({
        where: {
        isSubscription: true,
        planVariantId :  variantId ,  
        date: { gte: todayMidnight }
        }
    });

    // 4. If no schedules are left, exit the transaction early
    if (schedules.length === 0) return;

    // 5. Re-create the baseline group schedule templates
    await tx.groupSchedule.createMany({
        data: schedules.map((s: GroupSchedule) => ({
        planVariantId: variantId,
        dayOfWeek: Number(s.dayOfWeek),
        startHour: Number(s.startHour),
        duration: Number(s.duration || 90),
        })),
    });

    // 6. GENERATE FUTURE CALENDAR RESERVATION BLOCKS FOR ALL TABLES (NEXT 4 WEEKS)
    const WEEKS_TO_GENERATE = 8;
    const reservationEntries : Omit<Reservation , 'id'>[] = [];

    for (const slot of schedules) {
        const today = new Date();
        
        // Helper routine to bundle entries for all tables on a given date
        const addReservationsForDate = (targetDate: Date) => {
        TABLES_TO_BLOCK.forEach((tableNum) => {
            reservationEntries.push({
            date: targetDate,
            startHour: Number(slot.startHour),
            duration: Number(slot.duration || 90),
            table: tableNum,                 // Sets table column explicitly (1 or 2)
            isSubscription: true,            // Matches your semantic guard flag
            withCoach: true,
            withPaddles: false,
            userId: session.user.id,         // Linked to the creating manager profile}`, // Acts as our safe background identifier link
            planVariantId: variantId,
            });
        });
        };

        // Handle if the session is active on today's weekday specifically
        if (today.getDay() === Number(slot.dayOfWeek)) {
        const todayClean = new Date();
        todayClean.setHours(0,0,0,0);
        addReservationsForDate(todayClean);
        }

        // Generate upcoming weekly cycles
        for (let week = 0; week < WEEKS_TO_GENERATE; week++) {
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + (week * 7));
        
        const nextClassDate = getNextWeekdayDate(baseDate, Number(slot.dayOfWeek));
        addReservationsForDate(nextClassDate);
        }
    }

    // 7. Bulk-insert table rows directly into the central Reservation table
    if (reservationEntries.length > 0) {
        await tx.reservation.createMany({
        data: reservationEntries
        });
    }
    });

    return NextResponse.json({ success: true, message: "تم تحديث وحجز الطاولات على التقويم" });
} catch (error: unknown) {
    console.error("Failed to sync schedules into reservation calendar instances:", error);
    if (error instanceof Error) return NextResponse.json({ error: error.message || "حدث خطأ ما أثناء معالجة البيانات" }, { status: 500 });
    else return NextResponse.json({ error: "حدث خطأ ما أثناء معالجة البيانات" }, { status: 500 });
}
}
