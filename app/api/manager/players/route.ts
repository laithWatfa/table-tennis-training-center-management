// app/api/manager/players/route.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
const session = await auth();
if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "غير مصرح لك بإتمام هذه العملية" }, { status: 403 });
}

try {
    const { searchParams } = new URL(request.url);
    const userIdFilter = searchParams.get("userId");
    const nameSearch = searchParams.get("search");

        const whereClause : any = {};
    
    
        if (userIdFilter) {
        // Best performance: Manager selected a precise player from your autocomplete dropdown
        whereClause.id = userIdFilter;
        } else if (nameSearch && nameSearch.trim().length >= 2) {
        whereClause.user = {
            fullName: {
            contains: nameSearch,
            mode: "insensitive", 
            },
        };
        }

    // Fetch all players along with their total outstanding unpaid invoices
    const players = await prisma.user.findMany({
    where: whereClause,
    take: 50,
    include: {
        invoices: {
        where: { status: "UNPAID" },
        select: { amount: true }
        }
    },
    orderBy: { fullName: "asc" }
    });

    // Map data to calculate total debt amounts on the fly
    const formattedPlayers = players.map(player => {
    const totalDebt = player.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    return {
        id: player.id,
        fullName: player.fullName,
        email: player.email,
        createdAt : player.createAt,
        totalDebt,
        isWalkIn: player.email.endsWith("@local.com"),
    };
    });

    return NextResponse.json({ players: formattedPlayers });
} catch (error) {
    console.error("PLAYERS DIRECTORY GET ERROR:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحميل قائمة اللاعبين" }, { status: 500 });
}
}
