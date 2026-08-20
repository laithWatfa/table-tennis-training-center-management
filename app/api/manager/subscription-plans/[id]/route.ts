import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

// A. EDIT AN EXISTING PLAN
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
    const json = await request.json();
    const { name, classesPerWeek, monthlyPrice , withCoach, withPaddles} = json;

    // Verify the targeted plan actually exists first
    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existingPlan) {
    return NextResponse.json({ error: "الباقة المطلوبة غير موجودة" }, { status: 404 });
    }

    // Only append changes if the properties are explicitly provided in the request payload
    const updatedPlan = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
        ...(name ? { name: String(name) } : {}),
        ...(classesPerWeek !== undefined ? { classesPerWeek: Number(classesPerWeek) } : {}),
        ...(monthlyPrice !== undefined ? { monthlyPrice: Number(monthlyPrice) } : {}),
        ...(withCoach !== undefined ? { withCoach : Boolean(withCoach) } : {}),
        ...(withPaddles !== undefined ? { withPaddles : Boolean(withPaddles) } : {}),
    },
    });

    return NextResponse.json(updatedPlan);
} catch (error) {
    console.error("Update subscription plan error:", error);
    return NextResponse.json({ error: "فشل في تعديل بيانات باقة الاشتراك" }, { status: 500 });
}
}

// B. DELETE A PLAN
export async function DELETE(
request: Request,
{ params }: { params: { id: string } }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}

const { id } = await params;

try {
    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existingPlan) {
    return NextResponse.json({ error: "الباقة المطلوبة غير موجودة" }, { status: 404 });
    }

    // Process deletion
    await prisma.subscriptionPlan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "تم حذف الباقة بنجاح" });
} catch (error: unknown) {

if (error instanceof PrismaClientKnownRequestError) {

    if (error.code === 'P2002') {
    return NextResponse.json(
        { error: "This slot or item is already reserved." },
        { status: 400 }
    );
    }
}

const errorMessage = error instanceof Error ? error.message : "An unexpected database error occurred";
console.error("Database Error:", error);

return NextResponse.json(
    { error: errorMessage },
    { status: 500 }
);
}
}
