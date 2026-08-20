// lib/invoice-gate.ts
import prisma from "@/lib/prisma";

// const MAX_DEBT_LIMIT = 1000; // 👈 Set maximum allowed unpaid debt in ل.س

/**
 * Aggregates a player's unpaid balance and verifies threshold restrictions.
 */
export async function checkUnpaidLimit(userId: string) {

    const settings = await prisma.venueSetting.findUnique({ where: { id: "global-config" } });

    const MAX_DEBT_LIMIT = settings?.maxDebtLimit || 1000;

    
const aggregation = await prisma.invoice.aggregate({
    where: {
    userId: userId,
    status: "UNPAID",
    },
    _sum: {
    amount: true,
    },
});

const totalOutstandingDebt = aggregation._sum.amount || 0;

return {
    hasReachedLimit: totalOutstandingDebt >= MAX_DEBT_LIMIT,
    totalOutstandingDebt,
    limit: MAX_DEBT_LIMIT,
    remainingAllowance: Math.max(0, MAX_DEBT_LIMIT - totalOutstandingDebt),
};
}
