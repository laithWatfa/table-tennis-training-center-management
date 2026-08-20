// app/api/manager/age-groups/[id]/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
request: Request,
{ params }: { params: { id: string } }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
const data = await params;
try {
    await prisma.ageGroup.delete({
    where: { id: data.id },
    });
    return NextResponse.json({ success: true, message: "تم حذف الفئة العمرية بنجاح" });
} catch (error) {
    return NextResponse.json({ error: "فشل حذف الفئة العمرية" }, { status: 500 });
}
}
