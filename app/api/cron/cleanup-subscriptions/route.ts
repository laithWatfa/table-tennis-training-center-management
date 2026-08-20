import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
// 1. Secure the endpoint using an Environment Secret Token
const { searchParams } = new URL(request.url);
const authHeader = request.headers.get("authorization");
const cronToken = searchParams.get("token") || authHeader?.replace("Bearer ", "");

if (cronToken !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 });
}

try {
    const now = new Date();

    // 2. Fetch all active members whose subscriptions have officially passed their endDate
    const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
        endDate: { lt: now }, // End date is in the past
    },
    select: {
        userId: true,
        planVariantId: true,
    },
    });

    if (expiredSubscriptions.length === 0) {
    return NextResponse.json({
        success: true,
        message: "تم فحص العضويات بنجاح، لا توجد اشتراكات منتهية اليوم.",
        processedCount: 0,
    });
    }

    // 3. Extract player and group combinations to offload
    const targetUserIds = expiredSubscriptions.map((s) => s.userId);
    const targetVariantIds = expiredSubscriptions.map((s) => s.planVariantId);

    // 4. Update GroupMember rows inside an atomic transaction
    // Populating 'leftAt' removes them from active lists while preserving historical rosters
    const updateResult = await prisma.groupMember.updateMany({
    where: {
        userId: { in: targetUserIds },
        planeVariantId: { in: targetVariantIds }, // Matches your schema's 'planeVariantId' spelling
        leftAt: null, // Only offload members who haven't left yet
    },
    data: {
        leftAt: now,
    },
    });

    console.log(`[CRON SUCCESS] Processed ${updateResult.count} expired group members.`);

    return NextResponse.json({
    success: true,
    message: `تم إنهاء فترات التدريب بنجاح للعضويات المنتهية.`,
    processedCount: updateResult.count,
    }, { status: 200 });

} catch (error) {
    console.error("CRITICAL SUBSCRIPTION CLEANUP CRON ERROR:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي أثناء معالجة فحص الاشتراكات المنتهية" },
    { status: 500 }
    );
}
}
