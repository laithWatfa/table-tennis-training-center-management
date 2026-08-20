import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkUnpaidLimit } from "@/lib/invoice-gate";

// Helper function to calculate exact age from DateTime
function calculateAge(birthDate: Date): number {
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();

if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
}
return age;
}

export async function POST(request: Request) {
// 1. Authenticate the Player's Session securely on the server
const session = await auth();
if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
}

try {
    const debtCheck = await checkUnpaidLimit(session.user.id);
    if (debtCheck.hasReachedLimit) {
    return NextResponse.json(
        { 
        error: `تم إيقاف العمليات مؤقتاً لتجاوز حد المبالغ المستحقة المعلقة. رصيدك غير المدفوع حالياً هو (${debtCheck.totalOutstandingDebt.toLocaleString()} ل.س) والحد المسموح به هو (${debtCheck.limit.toLocaleString()} ل.س). يرجى تسديد ذممك المالية السابقة أولاً.` 
        }, 
        { status: 403 }
    );
    }
    const json = await request.json();
    const { planId, monthsDuration } = json;

    if (!planId || !monthsDuration) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة إلزامية" }, { status: 400 });
    }

    // 2. Fetch full user details to check their age
    const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    });

    if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const playerAge = calculateAge(new Date(user.dateOfBirth));

    // 3. Find the matching AgeGroup based on the player's calculated age
    const matchedAgeGroup = await prisma.ageGroup.findFirst({
    where: {
        minAge: { lte: playerAge },
        maxAge: { gte: playerAge },
    },
    });

    if (!matchedAgeGroup) {
    return NextResponse.json(
        { error: "عذراً، لا توجد فئة عمرية متاحة لعمرك حالياً في الصالة" },
        { status: 400 }
    );
    }

    // 4. Fetch the target subscription plan details
    const planData = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    });

    if (!planData) {
    return NextResponse.json({ error: "خطة الاشتراك المحددة غير موجودة" }, { status: 404 });
    }

    // 5. Run everything inside a secure atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
    
    // A. Get or create the unified PlanVariant intersect row
    const variant = await tx.planVariant.upsert({
        where: {
        planId_ageGroupId: {
            planId: planId,
            ageGroupId: matchedAgeGroup.id,
        },
        },
        update: {},
        create: {
        planId: planId,
        ageGroupId: matchedAgeGroup.id,
        displayName: `${planData.name} - ${matchedAgeGroup.name}`,
        },
    });

    // Calculate time boundaries and total amount
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + Number(monthsDuration));
    const totalAmount = planData.monthlyPrice * Number(monthsDuration);

    // B. Create the Subscription Contract
    const subscription = await tx.subscription.create({
        data: {
        userId: user.id,
        planVariantId: variant.id,
        startDate,
        endDate,
        },
    });

    // C. Register the player into the GroupMember roster for this variant
    await tx.groupMember.create({
        data: {
        userId: user.id,
        planeVariantId: variant.id, // Using your schema's exact spelling 'planeVariantId'
        joinedAt: startDate,
        },
    });

    // D. Generate an UNPAID invoice for the player to settle with the manager later
    const invoice = await tx.invoice.create({
        data: {
        amount: totalAmount,
        status: "UNPAID",
        userId: user.id,
        subscriptionId: subscription.id,
        },
    });

    // Fetch the group schedule template to return to the frontend view
    const schedules = await tx.groupSchedule.findMany({
        where: { planVariantId: variant.id },
    });

    return {
        variantName: variant.displayName,
        subscription,
        invoiceId: invoice.id,
        schedules,
    };
    });

    return NextResponse.json({
    success: true,
    message: "تم الاشتراك في الباقة بنجاح، يرجى تسديد الفاتورة لتنشيط الحساب بالكامل",
    data: result,
    }, { status: 201 });

} catch (error) {
    console.error("Player checkout workflow crash:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي أثناء معالجة طلب الاشتراك" },
    { status: 500 }
    );
}
}
