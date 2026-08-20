"use client";
import { Arrow } from "@/icons";
import { useState } from "react";

interface HourSelectorProps {
value: number;
availableHours: number[]; 
onChange: (hour: number) => void;
}

function formatHour(hour: number) {
const m = hour % 1 === 0 ? "00" : "30";
const period = hour >= 12 && hour < 24 ? "م" : "ص";
let displayHour = Math.floor(hour);
displayHour = displayHour % 12 === 0 ? 12 : displayHour % 12;
return `${displayHour}:${m} ${period}`;
}

export default function HourSelector({ value, availableHours, onChange }: HourSelectorProps) {
const [showDropdown, setShowDropdown] = useState(false);

// Safely sort the dynamic hours passed from the database/parent
const sortedHours = [...availableHours].sort((a, b) => a - b);
const firstThree = sortedHours.slice(0, 3);
const rest = sortedHours.slice(3);

return (
    <div className="w-full space-y-3">
    <p className="font-bold text-small block mb-1">اختر وقت البداية</p>

    {/* First 3 options */}
    <div className="flex w-full rounded-lg overflow-hidden border border-textSecondary">
        {firstThree.map((hour) => (
        <button
            key={hour}
            type="button" // Prevent accidental form submission triggers
            onClick={(e) => {
            e.preventDefault();
            onChange(hour);
            setShowDropdown(false);
            }}
            className={`px-4 py-2 font-bold text-small w-1/3 border-l text-sm transition ${
            value === hour
                ? "bg-secondary text-surface border-secondary"
                : "bg-surface text-textSecondary border-textSecondary hover:bg-gray-50 dark:hover:bg-slate-900"
            }`}
        >
            {formatHour(hour)}
        </button>
        ))}

        {/* Dropdown toggle button */}
        {rest.length > 0 && (
        <button
            type="button"
            onClick={(e) => {
            e.preventDefault();
            setShowDropdown(!showDropdown);
            }}
            className="px-3 py-2 flex items-center justify-center bg-surface hover:bg-gray-50 dark:hover:bg-slate-900 border-r w-[15%]"
        >
            <Arrow className={`text-textSecondary transform transition-transform ${showDropdown ? "rotate-180" : ""}`} />
        </button>
        )}
    </div>

    {/* Dropdown containing the remaining options */}
    {showDropdown && rest.length > 0 && (
        <div className="flex flex-wrap border rounded-lg shadow-sm bg-surface p-1 gap-1">
        {rest.map((hour) => (
            <button
            key={hour}
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onChange(hour);
                setShowDropdown(false); // Clean UX closure
            }}
            className={`px-3 py-2 font-bold text-small flex-1 min-w-[22%] text-center text-sm transition rounded-md ${
                value === hour
                ? "bg-secondary text-surface border-secondary"
                : "bg-surface text-textSecondary border-textSecondary hover:bg-gray-50 dark:hover:bg-slate-900"
            }`}
            >
            {formatHour(hour)}
            </button>
        ))}
        </div>
    )}
    </div>
);
}
