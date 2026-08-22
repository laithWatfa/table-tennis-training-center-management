import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";

export async function GET(request: Request) {
const session = await auth();

// Guard check: Ensure only authorized admins/managers can inspect invoices
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 50));
    const statusFilter = searchParams.get("status"); // e.g., "PAID" or "UNPAID"
    const orderBy = searchParams.get("orderBy")

    const userIdFilter = searchParams.get("userId"); 
    const nameSearch = searchParams.get("search")
    
    const skip = (page - 1) * limit;

    const whereClause : any = {
    ...( statusFilter ? { status: statusFilter as InvoiceStatus } : {}),
    };

    const sortClause = {
        [orderBy || "createdAt"] : "desc"
    }

        
    if (userIdFilter) {
    // Best performance: Manager selected a precise player from your autocomplete dropdown
    whereClause.userId = userIdFilter;
    } else if (nameSearch && nameSearch.trim().length >= 2) {
    whereClause.user = {
        fullName: {
        contains: nameSearch,
        mode: "insensitive", 
        },
    };
    }
    

    // Parallel processing for optimal execution speeds
    const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: sortClause, // Newest transaction records first
        include: {
        user: {
            select: { fullName: true, email: true },
        },
        reservation: true, // Details of the booking tied to it
        },
    }),
    prisma.invoice.count({ where: whereClause }),
    ]);

    return NextResponse.json({
    invoices,
    meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
    },
    });
} catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
}
}


export async function POST(request: Request) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

try {
    const json = await request.json();
    const { 
    userId, 
    amount, 
    status, 
    date, 
    startHour, 
    duration, 
    withCoach, 
    withPaddles 
    } = json;

    // Validate essential fields
    if (!userId || !amount || !status || !date || startHour === undefined || !duration) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    // Set conditional date parameter
    const isPaidNow = status === "PAID";

    // Atomically build both database items matching your exact structures
    const newInvoice = await prisma.invoice.create({
    data: {
        amount: Number(amount),
        status: status, // "PAID" | "UNPAID"
        paidAt: isPaidNow ? new Date() : null, // Sets current timestamp instantly if paid upfront
        user: { connect: { id: userId } },
        
        // Nested creation: Builds the reservation profile automatically
        reservation: {
        create: {
            date: new Date(date),
            startHour: Number(startHour),
            duration: Number(duration),
            withCoach: Boolean(withCoach),
            withPaddles: Boolean(withPaddles),
            userId: userId,
        }
        }
    },
    include: {
        reservation: true,
    }
    });

    return NextResponse.json(newInvoice, { status: 201 });
} catch (error) {
    console.error("Create invoice with reservation error:", error);
    return NextResponse.json({ error: "فشل في حفظ الحجز وإصدار الفاتورة" }, { status: 500 });
}
}
