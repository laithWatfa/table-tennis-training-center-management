// app/api/manager/invoices/new/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Make sure bcryptjs is installed for passwords

export async function POST(request: Request) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 403 });
}

try {
    const json = await request.json();
    const { 
    customerId, 
    customerName, 
    invoiceStatus, 
    amount 
    } = json;

    if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "يجب إدخال قيمة صحيحة للفاتورة" }, { status: 400 });
    }

    let finalUserId: string | null = customerId || null;

    // 🎯 DYNAMIC WALK-IN LOOKUP ENGINE
    if (!finalUserId) {
    const sanitizedName = customerName?.trim();
    if (!sanitizedName) {
        return NextResponse.json({ error: "يرجى إدخال اسم الزبون العابر" }, { status: 400 });
    }

    // 1. Check if this exact walk-in customer already exists in your database
    let walkInUser = await prisma.user.findFirst({
        where: {
        fullName: sanitizedName,
        email: { endsWith: "@local.com" } // Ensures we match only walk-in ghost accounts
        }
    });

    // 2. If they don't exist, generate a unique profile with generic metrics on the fly
    if (!walkInUser) {
        const genericPasswordHash = await bcrypt.hash("12345678!", 10);
        const genericBirthDate = new Date("2000-01-01");
        const uniquePin = Math.floor(1000 + Math.random() * 9000);

        walkInUser = await prisma.user.create({
        data: {
            fullName: sanitizedName,
            email: `guest-${uniquePin}@local.com`, // Generates a valid unique email constraint
            password: genericPasswordHash,          // Full structural password support
            dateOfBirth: genericBirthDate,          // Generic birth date anchor
            role: "Player",
        },
        });
    }

    finalUserId = walkInUser.id;
    }

    // 3. Create the standalone Invoice connected cleanly to our target user ID
    const invoice = await prisma.invoice.create({
    data: {
        amount: Number(amount),
        status: invoiceStatus === "paid" ? "PAID" : "UNPAID",
        paidAt: invoiceStatus === "paid" ? new Date() : null,
        userId: finalUserId,
        reservationId: null,
        subscriptionId: null,
    },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
} catch (error) {
    console.error("MANUAL INVOICE CREATION ERROR:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
}
}
