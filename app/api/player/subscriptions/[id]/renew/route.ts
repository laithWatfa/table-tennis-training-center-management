// app/api/player/subscriptions/[id]/renew/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
request: Request,
{ params }: { params: { id: string } }
) {
const session = await auth();
if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
}

const data = await params
const subscriptionId = data.id;

try {
    // 1. Fetch current subscription program along with variant pricing configurations
    const currentSub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { 
        planVariant: { include: { plan: true } } 
    }
    });

    if (!currentSub || currentSub.userId !== session.user.id) {
    return NextResponse.json({ error: "الاشتراك غير موجود" }, { status: 404 });
    }

    // 2. Prevent renewing an item that isn't settled yet
    const existingInvoices = await prisma.invoice.findMany({
    where: { subscriptionId: currentSub.id }
    });
    if (existingInvoices.some(inv => inv.status === "UNPAID")) {
    return NextResponse.json({ 
        error: "لا يمكنك تقديم طلب تجديد جديد بينما يحمل هذا الاشتراك فاتورة سابقة غير مدفوعة." 
    }, { status: 400 });
    }

    // 3. Time Boundary Calculation Guard: 
    // If current plan expires in the future, new plan starts EXACTLY when that one ends!
    // If it has already expired or is open, start it right now.
    const now = new Date();
    const baseStartDate = currentSub.endDate && new Date(currentSub.endDate) > now 
    ? new Date(currentSub.endDate) 
    : now;

    const calculatedEndDate = new Date(baseStartDate);
    calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 1); // Extend by 1 month baseline

    const monthlyCost = currentSub.planVariant.plan.monthlyPrice;

    // 4. Write data to your tables cleanly inside a transaction block
    const renewalResult = await prisma.$transaction(async (tx) => {
    
    // A. Create the linked continuation subscription row
    const newSubscription = await tx.subscription.create({
        data: {
        userId: session.user.id,
        planVariantId: currentSub.planVariantId,
        startDate: baseStartDate,
        endDate: calculatedEndDate,
        }
    });

    // B. Mint a separate invoice record tracking this distinct renewal extension month
    const newInvoice = await tx.invoice.create({
        data: {
        amount: monthlyCost,
        status: "UNPAID", // Must be paid to management before activating completely
        userId: session.user.id,
        subscriptionId: newSubscription.id
        }
    });

    return { newSubscription, invoiceId: newInvoice.id };
    });

    return NextResponse.json({
    success: true,
    message: "تم إنشاء طلب التجديد بنجاح! يرجى تسديد الفاتورة لتنشيط المدة الإضافية.",
    data: renewalResult
    }, { status: 201 });

} catch (error) {
    console.error("SUBSCRIPTION RENEW CRASH:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي أثناء معالجة طلب التجديد" }, { status: 500 });
}
}
