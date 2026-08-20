// app/api/manager/subscriptions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
// 1. Guard against unauthorized users and ensure active Admin session role
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

try {
    const json = await request.json();
    // 👈 Destructure the direct planVariantId from the simplified form payload
    const { userId, planVariantId, monthsDuration, invoiceStatus } = json;

    if (!userId || !planVariantId || !monthsDuration) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة إلزامية" }, { status: 400 });
    }

    // 2. Fetch the target PlanVariant along with its parent plan info to calculate the pricing tier
    const variantData = await prisma.planVariant.findUnique({
    where: { id: planVariantId },
    include: { plan: true },
    });

    if (!variantData) {
    return NextResponse.json({ error: "باقة الاشتراك المحددة غير صالحة أو غير موجودة" }, { status: 404 });
    }

    // 3. Execute database updates atomically using a secure transaction block
    const result = await prisma.$transaction(async (tx) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + Number(monthsDuration));
    
    // Calculate financial costs against subscription plan pricing matrices safely
    const totalCost = variantData.plan.monthlyPrice * Number(monthsDuration);

    // A. Create the core contractual Subscription record
    const subscription = await tx.subscription.create({
        data: {
        userId,
        planVariantId: variantData.id,
        startDate,
        endDate,
        },
    });

    // B. Inject player membership directly into the group roster layout tracker 
    await tx.groupMember.create({
        data: {
        userId,
        planeVariantId: variantData.id, // 👈 Using your schema's exact naming parameter ('planeVariantId')
        joinedAt: startDate,
        },
    });

    // C. Issue the formal Invoice and explicitly bind it to this new subscription record
    await tx.invoice.create({
        data: {
        amount: totalCost,
        status: invoiceStatus === "PAID" ? "PAID" : "UNPAID",
        paidAt: invoiceStatus === "PAID" ? new Date() : null,
        userId,
        subscriptionId: subscription.id, // 👈 Linking the invoice to the subscription
        },
    });

    return { subscription };
    });

    return NextResponse.json(result, { status: 201 });
} catch (error) {
    console.error("Subscription post error:", error);
    return NextResponse.json({ error: "فشل تسجيل المشترك بالمجموعة المحددة" }, { status: 500 });
}
}
