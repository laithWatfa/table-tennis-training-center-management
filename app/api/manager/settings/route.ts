// app/api/manager/settings/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. GET: Fetch global configurations
export async function GET() {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    const settings = await prisma.venueSetting.upsert({
    where: { id: "global-config" },
    update: {},
    create: {}, // Falls back to default schema values
    });
    return NextResponse.json(settings);
} catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
}
}

// 2. PUT: Update operational parameters
export async function PUT(request: Request) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    const json = await request.json();
    const { 
        tableRatePerHour, 
        coachRatePerHour, 
        paddlesFlatFee, 
        maxDebtLimit, 
        openHour, 
        closeHour,
        totalTables,
        cancellationWindow,
    } = json;

    const updated = await prisma.venueSetting.update({
    where: { id: "global-config" },
    data: {
        tableRatePerHour: Number(tableRatePerHour),
        coachRatePerHour: Number(coachRatePerHour),
        paddlesFlatFee: Number(paddlesFlatFee),
        maxDebtLimit: Number(maxDebtLimit),
        openHour: Number(openHour),
        closeHour: Number(closeHour),
        totalTables: Number(totalTables),
        cancellationWindow: Number(cancellationWindow),
    },
    });

    return NextResponse.json({ success: true, settings: updated });
} catch (error) {
    return NextResponse.json({ error: "Failed to update configurations" }, { status: 500 });
}
}
