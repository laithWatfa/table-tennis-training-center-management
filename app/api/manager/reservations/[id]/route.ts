// app/api/manager/reservations/[id]/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
request: Request,
{ params }: { params: { id: string } }
) {
// 1. Enforce strict Admin authorization guard rules
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 403 });
}
const {id} = await params
const reservationId = id;
// const reservationId =  await params.id;
console.log("id.....",reservationId)

if (!reservationId) {
    return NextResponse.json({ error: "معرف الحجز مطلوب" }, { status: 400 });
}

try {
    // 2. Fetch the target reservation first to see if an invoice is linked
    const targetReservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { invoice: true },
    });

    if (!targetReservation) {
    return NextResponse.json({ error: "الحجز المحدد غير موجود بالفعل" }, { status: 404 });
    }

    // 3. Execute data purge safely inside an atomic database transaction
    await prisma.$transaction(async (tx) => {
    
    // A. If an associated Invoice row exists, delete it first to prevent breaking foreign key constraints
    if (targetReservation.invoice) {
        await tx.invoice.delete({
        where: { id: targetReservation.invoice.id },
        });
    }

    // B. Delete the core Reservation record safely
    await tx.reservation.delete({
        where: { id: reservationId },
    });
    });

    return NextResponse.json({
    success: true,
    message: "تم إلغاء وحذف الحجز مع الفاتورة المرتبطة به بنجاح من النظام.",
    }, { status: 200 });

} catch (error) {
    console.error("CRITICAL RESERVATION DELETE ERROR:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي في الخادم أثناء محاولة حذف وإلغاء هذا الحجز" },
    { status: 500 }
    );
}
}
