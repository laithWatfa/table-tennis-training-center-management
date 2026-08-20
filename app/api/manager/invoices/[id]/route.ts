import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
request: Request,
{ params }: { params: { id: string } }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

const { id } = await params;

try {
// Look up the invoice to confirm it exists and pull its reservation link
const targetInvoice = await prisma.invoice.findUnique({
    where: { id },

});

if (!targetInvoice) {
    return NextResponse.json({ error: "الفاتورة المطلوبة غير موجودة" }, { status: 404 });
}

// Process a safe database transaction to update both entries simultaneously
const updatedInvoice = await prisma.$transaction(async (tx) => {
    // 1. Update the Invoice row metadata parameters
    const invoiceUpdate = await tx.invoice.update({
    where: { id },
    data: {
        status: "PAID",
        paidAt: new Date(), // Sets payment timestamp to the exact current moment
    },
    });


    return invoiceUpdate;
});

return NextResponse.json(updatedInvoice);
} catch (error) {
console.error("Update invoice payment status error:", error);
return NextResponse.json({ error: "فشل في تحديث حالة دفع الفاتورة" }, { status: 500 });
}
}
