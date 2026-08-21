// app/api/manager/players/[id]/delete/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
const session = await auth();

// 1. Authorization Guard
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 403 });
}

const {id} = await params
const playerId = id;

try {
    // 2. Fetch the target profile first to verify existence
    const targetUser = await prisma.user.findUnique({
    where: { id: playerId },
    include: { invoices: true }
    });

    if (!targetUser) {
    return NextResponse.json({ error: "حساب اللاعب المحدد غير موجود بالفعل" }, { status: 404 });
    }

    // 🔒 CRITICAL SYSTEM CONTROL: Prevent admins from accidentally wiping their own accounts
    if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "لا يمكنك حذف حسابك الشخصي النشط من النظام" }, { status: 400 });
    }

    // 3. Execute cascading purges inside a safe atomic database transaction
    await prisma.$transaction(async (tx) => {
    
    // A. Delete or unlink group memberships
    await tx.groupMember.deleteMany({
        where: { userId: playerId }
    });

    // B. Delete all active subscriptions owned by this player
    await tx.subscription.deleteMany({
        where: { userId: playerId }
    });

    // C. Delete all invoices mapped to this profile
    await tx.invoice.deleteMany({
        where: { userId: playerId }
    });

    // D. Delete all table reservations booked by this player
    await tx.reservation.deleteMany({
        where: { userId: playerId }
    });

    // E. Finally, delete the core User row safely
    await tx.user.delete({
        where: { id: playerId }
    });
    });

    return NextResponse.json({ 
    success: true, 
    message: "تم حذف اللاعب وإلغاء كافة سجلاته وفواتيره من النظام بنظام التعاقب بنجاح." 
    });

} catch (error) {
    console.error("CRITICAL USER DELETE CRASH:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي في الخادم أثناء محاولة تصفية وحذف هذا الحساب" },
    { status: 500 }
    );
}
}
