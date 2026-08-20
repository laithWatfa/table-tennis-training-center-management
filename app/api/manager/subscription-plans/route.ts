import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// A. FETCH ALL SUBSCRIPTION PLANS
export async function GET() {
try {
    const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { monthlyPrice: "asc" }, // Order from lowest to highest price
    include: {
        variants: true, // Includes associated nested variants if they exist
    },
    });
    return NextResponse.json(plans);
} catch (error) {
    console.error("Fetch plans error:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
}
}

// B. ADD A NEW SUBSCRIPTION PLAN
export async function POST(request: Request) {
const session = await auth();

// Role Guard: Ensure only administrators can create system plans
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

try {
    const json = await request.json();
    const { name, classesPerWeek, monthlyPrice } = json;

    // Validate essential properties match your model fields
    if (!name || classesPerWeek === undefined || monthlyPrice === undefined) {
    return NextResponse.json({ error: "يرجى ملء جميع الحقول الإلزامية" }, { status: 400 });
    }

    const newPlan = await prisma.subscriptionPlan.create({
    data: {
        name: String(name),
        classesPerWeek: Number(classesPerWeek),
        monthlyPrice: Number(monthlyPrice),
    },
    });

    return NextResponse.json(newPlan, { status: 201 });
} catch (error) {
    console.error("Create subscription plan error:", error);
    return NextResponse.json({ error: "فشل في حفظ باقة الاشتراك الجديدة" }, { status: 500 });
}
}
