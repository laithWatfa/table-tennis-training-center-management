// components/ui/DynamicSkeleton.tsx
import { Skeleton } from "./Skeleton";

interface DynamicSkeletonProps {
type: "invoices" | "table" | "reservations";
cardsCount?: number;
}

export default function DynamicSkeleton({ type, cardsCount = 6 }: DynamicSkeletonProps) {
// 1. Generic Grid view fallback (Invoices, Subscriptions, Available Plans)
if (type === "invoices") {
    return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-pulse">
        {Array.from({ length: cardsCount }).map((_, i) => (
        <div key={i} className="bg-surface rounded-lg p-5 border shadow-basic space-y-3">
            <div className="flex justify-between"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-12" /></div>
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        ))}
    </div>
    );
}

// 2. Generic Data Table view fallback (Player Lists, Logs, Transactions)
if (type === "table") {
    return (
    <div className="border dark:border-slate-800 rounded-lg overflow-hidden bg-surface space-y-4 p-4 animate-pulse">
        <div className="flex gap-4 border-b pb-3"><Skeleton className="h-6 flex-1" /><Skeleton className="h-6 flex-1" /><Skeleton className="h-6 flex-1" /></div>
        {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 pt-1"><Skeleton className="h-5 flex-1" /><Skeleton className="h-5 flex-1" /><Skeleton className="h-5 flex-1" /></div>
        ))}
    </div>
    );
}


return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-surface p-4 rounded-lg border shadow-basic h-80 flex flex-col items-center justify-between">
        <Skeleton className="h-80 w-12" />
        <Skeleton className="h-80 w-8 rounded-full" />
        </div>
    ))}
    </div>
);
}
