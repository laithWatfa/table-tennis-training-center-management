// app/api/manager/plan-variants/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatHour(hour: number): string {
const m = hour % 1 === 0 ? "00" : "30";
const period = hour >= 12 && hour < 24 ? "م" : "ص";
let displayHour = Math.floor(hour);
displayHour = displayHour % 12 === 0 ? 12 : displayHour % 12;
return `${displayHour}:${m} ${period}`;
}

export async function GET() {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    // We now look up active variants since they house the distinct rosters and schedules!
    const variants = await prisma.planVariant.findMany({
    include: {
        schedules: true,
        members: {
        where: { leftAt: null },
        include: {
            user: { select: { id: true, fullName: true, dateOfBirth: true } }
        }
        },
    }
    });

    const now = new Date();

    // Map the database structures to cleanly output to your frontend visual components
    const formattedCohorts = variants.map((v) => {
    const schedules = v.schedules.map((s) => ({
        day: ARABIC_DAYS[s.dayOfWeek] || "يوم غير معروف",
        time: formatHour(s.startHour),
        duration: s.duration
    }));

    const players = v.members.map((m) => {
        const birthDate = new Date(m.user.dateOfBirth);
        let age = now.getFullYear() - birthDate.getFullYear();
        const mDiff = now.getMonth() - birthDate.getMonth();
        if (mDiff < 0 || (mDiff === 0 && now.getDate() < birthDate.getDate())) age--;

        return {
        id: m.user.id,
        name: m.user.fullName,
        age: Math.max(0, age)
        };
    });

    return {
        id: v.id,
        name: v.displayName, // e.g. "Premium - تحت 13 سنة"
        schedules,
        players
    };
    });

    return NextResponse.json(formattedCohorts);
} catch (error) {
    console.error("Fetch variants semantic flow error:", error);
    return NextResponse.json({ error: "خطأ داخلي في معالجة القوائم" }, { status: 500 });
}
}
