"use client";

import React from "react";

interface SundayCalendarInputProps {
value: string; // "YYYY-MM-DD"
onChange: (dateStr: string) => void;
}

export default function SundayCalendarInput({ value, onChange }: SundayCalendarInputProps) {

const handleDateSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (!rawValue) return;

    const chosenDate = new Date(rawValue);
    const dayOfWeek = chosenDate.getDay(); // 0 = Sunday, 1 = Monday...

    // If it's not a Sunday, auto-snap back to the Sunday of that week
    if (dayOfWeek !== 0) {
    chosenDate.setDate(chosenDate.getDate() - dayOfWeek);
    }

    // Format back to YYYY-MM-DD string
    const year = chosenDate.getFullYear();
    const month = String(chosenDate.getMonth() + 1).padStart(2, "0");
    const day = String(chosenDate.getDate()).padStart(2, "0");
    
    onChange(`${year}-${month}-${day}`);
};

return (
    <div className="flex-col gap-1 w-full max-w-xs hidden md:flex">
    <label htmlFor="sunday-picker" className="font-bold text-small text-textPrimary">
        اختر الأسبوع المطلوب  :
    </label>
    <input
        id="sunday-picker"
        type="date"
        value={value}
        onChange={handleDateSelection}
        className="w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface focus:outline-none"
    />
    <p className="text-[11px] text-textSecondary italic mt-0.5">
        * سيقوم النظام تلقائياً بضبط الاختيار على يوم الأحد الخاص بالأسبوع المختار.
    </p>
    </div>
);
}
