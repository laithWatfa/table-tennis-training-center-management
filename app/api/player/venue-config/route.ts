
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
// 1. Ensure the user is logged in (can be an Admin or a Player)
const session = await auth();
if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
}

try {
    // 2. Fetch or initialize the single global configuration row
    const settings = await prisma.venueSetting.upsert({
    where: { id: "global-config" },
    update: {},
    create: {}, // Falls back to schema defaults automatically
    });

    // 3. Return only the safe, public data parameters needed by the frontend
    return NextResponse.json({
    totalTables: settings.totalTables,
    openHour: settings.openHour,
    closeHour: settings.closeHour,
    cancellationWindow: settings.cancellationWindow,
    });
} catch (error) {
    console.error("PUBLIC VENUE CONFIG GET ERROR:", error);
    return NextResponse.json({ error: "فشل تحميل إعدادات الصالة العامة" }, { status: 500 });
}
}
