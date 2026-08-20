// app/api/player/subscriptions/[id]/cancel/route.ts
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
const {id} = await params
const subscriptionId = id;

try {
    // 1. Fetch subscription details along with its invoice statuses
    const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { invoices: true }
    });

    if (!sub || sub.userId !== session.user.id) {
    return NextResponse.json({ error: "الاشتراك غير موجود أو لا ينتمي لحسابك" }, { status: 404 });
    }

    const linkedInvoice = sub.invoices[0]; // Primary billing invoice link
    const isPaid = linkedInvoice?.status === "PAID";

    if (!isPaid) {
    // 🎯 CASE A: UNPAID CONTRACT -> HARD PURGE EVERYTHING ATOMICALLY
    await prisma.$transaction(async (tx) => {
        // Drop the invoice first to clear foreign key ties
        if (linkedInvoice) {
        await tx.invoice.delete({ where: { id: linkedInvoice.id } });
        }

        // Drop their active group membership roster row
        await tx.groupMember.deleteMany({
        where: {
            userId: session.user.id,
            planeVariantId: sub.planVariantId,
            leftAt: null
        }
        });

        // Delete the subscription record cleanly
        await tx.subscription.delete({ where: { id: subscriptionId } });
    });

    return NextResponse.json({ 
        success: true, 
        message: "تم إلغاء الاشتراك وحذف الفاتورة المعلقة بنجاح." 
    });
    } else {
    // 🎯 CASE B: PAID CONTRACT -> SOFT CLOSURE
    // Instead of wiping the record, make sure it cannot be renewed.
    // If it has no fixed end date, set it to lock right now.
    if (!sub.endDate) {
        await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { endDate: new Date() }
        });
    }

    return NextResponse.json({ 
        success: true, 
        message: "تم إلغاء التجديد التلقائي. ستظل باقتك نشطة ومتاحة للتمرين حتى نهاية المدة المدفوعة." 
    });
    }

} catch (error) {
    console.error("SUBSCRIPTION CANCEL CRASH:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي أثناء إلغاء الاشتراك" }, { status: 500 });
}
}
