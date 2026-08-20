// app/api/manager/age-groups/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. GET: Fetch all active age categories
export async function GET() {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    const ageGroups = await prisma.ageGroup.findMany({
    orderBy: { minAge: "asc" },
    });
    return NextResponse.json(ageGroups);
} catch (error) {
    return NextResponse.json({ error: "فشل تحميل الفئات العمرية" }, { status: 500 });
}
}

// 2. POST: Add a new custom age bracket tier
export async function POST(request: Request) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    const { name, minAge, maxAge } = await request.json();

    if (!name || minAge === undefined || maxAge === undefined) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    if (Number(minAge) > Number(maxAge)) {
    return NextResponse.json({ error: "الحد الأدنى للسن لا يمكن أن يكون أكبر من الحد الأقصى" }, { status: 400 });
    }

    const newGroup = await prisma.ageGroup.create({
    data: {
        name: String(name),
        minAge: Number(minAge),
        maxAge: Number(maxAge),
    },
    });

    return NextResponse.json({ success: true, ageGroup: newGroup }, { status: 201 });
} catch (error) {
    return NextResponse.json({ error: "حدث خطأ داخلي أثناء إنشاء الفئة العمرية" }, { status: 500 });
}
}
