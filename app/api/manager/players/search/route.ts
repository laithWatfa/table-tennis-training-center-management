import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
const session = await auth();

// Guard check: Ensure only authenticated managers can look up accounts
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

const { searchParams } = new URL(request.url);
const query = searchParams.get("q") || "";

// Return empty list if query is too short to optimize database workload
if (query.trim().length < 2) {
    return NextResponse.json([]);
}

try {
    const users = await prisma.user.findMany({
    where: {
        fullName: {
        contains: query,
        mode: "insensitive", // Works perfectly across English text variations
        },
    },
    take: 7, // Limit suggestions for clean UI spacing
    select: {
        id: true,
        fullName: true,
        email: true,
    },
    });

    return NextResponse.json(users);
} catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}
