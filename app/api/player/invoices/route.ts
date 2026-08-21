import { auth } from "@/auth";
import { checkUnpaidLimit } from "@/lib/invoice-gate";
import prisma from "@/lib/prisma";
import { InvoiceStatus } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
const session = await auth();

// 1. Guard against unauthenticated requests
if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const { searchParams } = new URL(request.url);
const page = Math.max(1, Number(searchParams.get("page") || 1));
const limit = Math.max(1, Number(searchParams.get("limit") || 40));
const statusFilter = searchParams.get("status"); // e.g., "PAID" or "UNPAID"
const orderBy = searchParams.get("orderBy")

const skip = (page - 1) * limit;

    const whereClause : any = {
    ...( statusFilter ? { status: statusFilter as InvoiceStatus } : {}),
    };

    const sortClause = {
        [orderBy || "createdAt"] : "desc"
    }

try {
    // 2. Query reservations while cleanly joining invoice metadata
    const invoices = await prisma.invoice.findMany({
    skip,
    where: { 
        userId: session.user.id,
        ...whereClause 
    },
    orderBy: sortClause,
    include: {
        reservation: {
        select: {
            duration: true, 
            isSubscription: true, 
        }
        }
    }
    });

        const debtCheck = await checkUnpaidLimit(session.user.id);

    // Return invoices wrapped alongside the financial block metadata
    return NextResponse.json({
    invoices,
    debtMetrics: {
        isBlocked: debtCheck.hasReachedLimit,
        currentDebt: debtCheck.totalOutstandingDebt,
        allowedLimit: debtCheck.limit,
        remainingBudget: debtCheck.remainingAllowance
    }
    });
    
} catch (error) {
    console.error("Error fetching player invoices with invoices:", error);
    return NextResponse.json(
    { error: "حدث خطأ داخلي أثناء جلب الحجوزات والعمليات المالية" }, 
    { status: 500 }
    );
}
}
