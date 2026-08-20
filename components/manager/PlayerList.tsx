"use client";

import { Person } from "@/icons";
import Link from "next/link";
import { useState } from "react";
import { ImProfile } from "react-icons/im";

// Helper to convert dates cleanly into standard formatting strings
const formatDate = (date: Date | string | null): string => {
if (date) return new Intl.DateTimeFormat("en-GB").format(new Date(date));
return "غير محدد";
};

// Interface matching your calculated player backend payload keys
interface PlayerListItem {
id: string;
fullName: string;
email: string;
createdAt: string;
totalDebt: number;
isWalkIn: boolean;
}

interface Props {
players: PlayerListItem[];
onPlayerActionTriggered?: () => void; 
}

export default function PlayerList({ players, onPlayerActionTriggered }: Props) {
// Local tracking state in case you trigger fast status or row mutations later
const [loadingPlayerIds, setLoadingPlayerIds] = useState<Record<string, boolean>>({});

return (
    <div className="w-full rounded-xl overflow-hidden lg:shadow-basic mt-4">
    
    {/* ========================================================================= */}
    {/* 🖥️ LARGE MONITOR DESKTOP GRID LAYOUT SYSTEM                               */}
    {/* ========================================================================= */}
    <div className="hidden lg:grid grid-cols-5 bg-primary text-white p-3 rounded-t-xl font-semibold text-sm">
        <div className="text-right">اللاعب</div>
        <div className="text-right">نوع الحساب</div>
        <div className="text-right">تاريخ الانضمام</div>
        <div className="text-right">الذمم المعلقة</div>
        <div className="text-center">الملف الشخصي</div>
    </div>

    {/* Desktop Rows Wrapper Content mapping node array elements */}
    <div className="hidden lg:flex flex-col border border-gray-bg overflow-hidden rounded-b-xl divide-y">
        {players.map((player) => {
        const isRowLoading = loadingPlayerIds[player.id];
        return (
            <div key={player.id} className="grid grid-cols-5 p-3 text-sm items-center bg-surface">
            
            {/* Column 1: Full Name layout block */}
            <div className="text-right font-medium text-textPrimary">{player.fullName}</div>
            
            {/* Column 2: Account type categorization labels */}
            <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    player.isWalkIn 
                        ? "bg-gray-50 text-textSecondary dark:bg-gray-950/20" 
                        : "bg-blue-50 text-secondary dark:bg-blue-950/20"
                }`}>
                {player.isWalkIn ? "زبون عابر" : "عضو مسجل"}
                </span>
            </div>
            
            {/* Column 3: Format creation registration timeline date */}
            <div className="text-right text-textSecondary">{formatDate(player.createdAt)}</div>
            
            {/* Column 4: Dynamic balance debt calculations output status line */}
            <div className={`text-right font-bold ${player.totalDebt > 0 ? "text-amber font-bold" : "text-accent"}`}>
                {player.totalDebt > 0 ? `${player.totalDebt.toLocaleString()} ل.س` : "0 ل.س"}
            </div>
            
            {/* Column 5: Safe anchor navigation dispatcher link trigger */}
            <div className="text-right">
                <Link
                href={`/manager/players/${player.id}`}
                className="outlined-button !items-center gap-2 !py-1 !text-secondary !border-secondary hover:!bg-secondary hover:!text-surface" 
                >
                    <ImProfile/>
                    عرض الملف 
                </Link>
            </div>

            </div>
        );
        })}
    </div> 

    {/* ========================================================================= */}
    {/* 📱 MOBILE CARDS SYSTEM RESPONSIVE MEDIA BREAKPOINT BLOCKS                  */}
    {/* ========================================================================= */}
    <div className="lg:hidden space-y-3 md:grid md:space-y-0 md:grid-cols-2 gap-4">
        {players.map((player) => {
        return (
            <Link
            href={`/manager/players/${player.id}`}
            key={player.id}
            className="border rounded-xl py-2 px-4 shadow-sm flex flex-col gap-3 bg-surface border-gray-100 dark:border-slate-800"
            >
            <div className="flex justify-between items-center">
                
                {/* Mobile Card Left/Main block layout details parameter text lists */}
                <div className="flex flex-col gap-0.5 max-w-[50%] text-right">
                <div className="flex gap-2 items-center font-bold text-right text-small text-textPrimary truncate">
                    <Person className="text-primary flex-shrink-0" />
                    {player.fullName}
                </div>

                <div className="flex flex-wrap items-center gap-[2px] text-xs text-textSecondary mt-1">
                    <span className="font-bold">انضم بتاريخ: </span>
                    <span>{formatDate(player.createdAt)}</span>
                </div>

                <div className="text-[10px] text-textSecondary font-bold truncate tracking-tight mt-0.5" dir="ltr">
                    {player.email}
                </div>
                </div>

                {/* Mobile Card Right block operational balance metrics indicators and buttons */}
                <div className="flex flex-col gap-1.5 font-bold text-body items-center w-1/2 border-r-2 border-textSecondary mr-1">
                
                {/* Account Badge text indicator */}
                <div className="text-label truncate w-full pl-2 text-center">
                    <span className={`text-meta px-2 py-0.5 rounded-full font-bold ${
                    player.isWalkIn 
                        ? "bg-gray-50 text-textSecondary dark:bg-gray-950/20" 
                        : "bg-blue-50 text-secondary dark:bg-blue-950/20"
                    }`}>
                    {player.isWalkIn ? "زبون عابر" : "عضو مسجل"}
                    </span>
                </div>

                {/* Pending Debt display window metric status */}
                <span className={`text-meta font-bold ${player.totalDebt > 0 ? "text-amber font-bold" : "text-accent"}`}>
                    {player.totalDebt > 0 ? `ذمم: ${player.totalDebt.toLocaleString()} ل.س` : "لا يوجد ديون"}
                </span>
                
                {/* Action Link button markup element trigger */}
                {/* <Link
                    href={`/manager/players/${player.id}`}
                    className="flex items-center justify-center px-4 py-1.5 bg-secondary hover:brightness-95 active:brightness-90 text-surface 
                    text-xs font-bold rounded-md w-[85%] transition shadow-sm text-center"
                >
                    عرض الملف الكامل
                </Link> */}

                </div>

            </div>
            </Link>
        );
        })}
    </div>

    </div>
);
}
