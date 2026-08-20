"use client";

import React, { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import UserAutocomplete from "@/components/manager/UserAutocomplete";
import PlayerList from "@/components/manager/PlayerList";

interface PlayerRow {
id: string;
fullName: string;
email: string;
createdAt: string;
totalDebt: number;
isWalkIn: boolean;
}

export default function ManagerPlayersPage() {
const [players, setPlayers] = useState<PlayerRow[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [isLoading, setIsLoading] = useState(true);
const [currentUserId,setCurrentUserId] = useState("")

useEffect(() => {
    async function loadPlayers() {
    try {
        const res = await fetch(`/api/manager/players?userId=${currentUserId}`);
        if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
    }
    loadPlayers();
}, [currentUserId]);

// Filter list by name or email strings
const filteredPlayers = players.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
);

if (isLoading) {
    return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-textSecondary gap-2">
        <CgSpinner className="animate-spin text-h1 text-secondary" />
        <p className="font-semibold">جاري تحميل دليل اللاعبين...</p>
    </div>
    );
}

return (
    <div className="space-y-6 w-full max-w-5xl mx-auto px-1 text-right">
    <div>
        <h1 className="text-h2 font-bold text-textPrimary">دليل اللاعبين والزبائن</h1>
        <p className="text-textSecondary text-sm mt-1">عرض وإدارة الحسابات، وتتبع الديون والمعاملات المعلقة لكل لاعب.</p>
    </div>

    {/* Search Input Bar */}
    <div className="relative max-w-72 ml-0">
        <UserAutocomplete currentUserId={currentUserId} onUserSelect={setCurrentUserId}/>
    </div>

    <PlayerList 
      players={filteredPlayers} 
    //   onPlayerActionTriggered={() => router.refresh()} 
    />
    </div>
);
}
