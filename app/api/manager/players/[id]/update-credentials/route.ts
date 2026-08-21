// app/api/manager/players/[id]/update-credentials/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(
request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 403 });
}

try {
    const json = await request.json();
    const { email, password, dateOfBirth } = json;
    const data = await params
    const playerId =  data.id;

    if (!email?.trim()) {
    return NextResponse.json({ error: "البريد الإلكتروني حقل مطلوب" }, { status: 400 });
    }

    // 1. Check email uniqueness constraints (exclude the current user being edited)
    const existingEmailUser = await prisma.user.findFirst({
    where: {
        email: email.trim(),
        NOT: { id: playerId }
    }
    });

    if (existingEmailUser) {
    return NextResponse.json({ error: "البريد الإلكتروني المدخل مستخدم بالفعل في حساب آخر" }, { status: 400 });
    }

    // 2. Prepare atomic payload modifications data array
    const updateData: any = {
    email: email.trim(),
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    };

    // 🎯 PASSWORD OVERRIDE CONTROL: Only re-hash and change if a string was typed
    if (password && password.trim().length > 0) {
    if (password.trim().length < 6) {
        return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات" }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
    where: { id: playerId },
    data: updateData,
    });

    return NextResponse.json({ 
    success: true, 
    message: "تم تحديث بيانات الملف الشخصي وكلمة المرور بنجاح." 
    });

} catch (error) {
    console.error("ADMIN USER UPDATE ERROR:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم أثناء حفظ البيانات" }, { status: 500 });
}
}
