// app/api/manager/admins/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


const SUPER_ADMIN_EMAIL = "laith.2723@gmail.com";

// 1. GET: Fetch list of all active system administrators
export async function GET() {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 403 });
}

try {
    const admins = await prisma.user.findMany({
    where: { role: "Admin" },
    select: {
        id: true,
        fullName: true,
        email: true,
    },
    orderBy: { fullName: "asc" }
    });

    return NextResponse.json({
    admins,
    isSuperAdmin: session.user.email === SUPER_ADMIN_EMAIL
    });
} catch (error) {
    return NextResponse.json({ error: "فشل تحميل قائمة المشرفين" }, { status: 500 });
}
}
export async function POST(request: Request) {
const session = await auth();
if (!session?.user?.email || session.user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

try {
    const { email, action } = await request.json(); // action = "PROMOTE" | "DEMOTE"

    if (!email) return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });

    if (email.trim() === SUPER_ADMIN_EMAIL && action === "DEMOTE") {
        return NextResponse.json({ error: "لا يمكن سحب صلاحيات الحساب الرئيسي المالك للنظام" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return NextResponse.json({ error: "المستخدم غير موجود بالنظام" }, { status: 404 });

    const updatedUser = await prisma.user.update({
    where: { email },
    data: {
        role: action === "PROMOTE" ? "Admin" : "Player",
    },
    });

    return NextResponse.json({
    success: true,
    message: action === "PROMOTE" ? "تمت ترقية العضو إلى مشرف بنجاح" : "تم إلغاء صلاحيات المشرف عن العضو",
    user: { fullName: updatedUser.fullName, role: updatedUser.role }
    });
} catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
}
