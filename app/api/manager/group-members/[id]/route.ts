import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

const { id } = await params;

try {
    const json = await request.json();
    const { action } = json; // e.g. "TERMINATE"

    if (action === "TERMINATE") {
    const terminatedMember = await prisma.groupMember.update({
        where: { id },
        data: {
        leftAt: new Date(), // Sets resignation moment timestamp
        },
    });
    return NextResponse.json(terminatedMember);
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
} catch (error) {
    return NextResponse.json({ error: "فشل تعديل حالة عضوية المجموعة" }, { status: 500 });
}
}
