"use client";

import React, { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { FaPlus , FaChevronDown ,FaDeleteLeft} from "react-icons/fa6";
import { parse } from "path";
interface ApiScheduleItem {
day: string;     // e.g., "الأحد"
time: string;    // e.g., "16:30"
duration: number; // 👈 Added duration to API contract
}

interface UpdateScheduleFormProps {
variantId: string;
variantName: string;
initialSchedules?: ApiScheduleItem[]; 
setShow: (show: boolean) => void;
}

const DAYS_MAP = [
{ value: 0, label: "الأحد" },
{ value: 1, label: "الاثنين" },
{ value: 2, label: "الثلاثاء" },
{ value: 3, label: "الأربعاء" },
{ value: 4, label: "الخميس" },
{ value: 5, label: "الجمعة" },
{ value: 6, label: "السبت" },
];

const DURATION_OPTIONS = [
{ value: 60, label: "60 دقيقة (ساعة)" },
{ value: 90, label: "90 دقيقة (ساعة ونصف)" },
{ value: 120, label: "120 دقيقة (ساعتان)" },
];

function parseTimeToFloat(timeString: string): number {
    // 1. Fallback guard if input is completely empty or missing a colon
    if (!timeString || !timeString.includes(":")) return 16;

    // 2. Detect the Arabic period markers safely
    const isPm = timeString.includes("م");

    // 3. Strip away all Arabic letters and trailing empty spaces
    const cleanedString = timeString.replace(/[صم\s]/g, "");

    // 4. Split by colon and parse cleanly into numeric parameters
    const [rawHours, rawMinutes] = cleanedString.split(":").map(d => Number(d));

    // 5. Fallback guard if parsing failed entirely
    if (isNaN(rawHours) || isNaN(rawMinutes)) return 16;

    // 6. Convert to 24-hour float representation format 
    let hours = rawHours;
    if (isPm && hours !== 12) {
        hours += 12; // E.g., 4:00 PM becomes 16
    } else if (!isPm && hours === 12) {
        hours = 0;  // 12:00 AM midnight adjustments
    }

    const floatValue = hours + (rawMinutes / 60);

    console.log(`⏱️ Input: "${timeString}" ➡️ Cleaned: ${rawHours}:${rawMinutes} | PM: ${isPm}`);
    console.log(`🎯 Calculated Float Result: ${floatValue}`);

    return floatValue;
}


function formatFloatToTime(hourFloat: number): string {
const hours = Math.floor(hourFloat);
const minutes = Math.round((hourFloat % 1) * 60);
const pad = (num: number) => String(num).padStart(2, "0");
return `${pad(hours)}:${pad(minutes)}`;
}

export default function UpdateScheduleForm({
variantId,
variantName,
initialSchedules = [],
setShow,
}: UpdateScheduleFormProps) {
const { mutate } = useSWRConfig();

// Local state manages structural configurations
const [slots, setSlots] = useState<{ dayOfWeek: number; startHour: number; duration: number }[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    if (initialSchedules && initialSchedules.length > 0) {
    const mappedSlots = initialSchedules.map((item) => {
        const dayMatch = DAYS_MAP.find((d) => d.label === item.day.trim());
        return {
        dayOfWeek: dayMatch ? dayMatch.value : 0,
        startHour: parseTimeToFloat(item.time),
        duration: item.duration || 60, // 👈 Fallback default
        };
    });
    setSlots(mappedSlots);
    } else {
    setSlots([{ dayOfWeek: 0, startHour: 16, duration: 60 }]);
    }
}, [initialSchedules]);

const addRow = () => {
    setSlots((prev) => [...prev, { dayOfWeek: 0, startHour: 16, duration: 60 }]);
};

const removeRow = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
};

const updateRow = (index: number, field: "dayOfWeek" | "startHour" | "duration", value: number) => {
    setSlots((prev) =>
    prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 1. Validation Step: Scan table entries for direct time/day duplication collisions
    const seenSlots = new Set<string>();
    for (const slot of slots) {
    const uniqueKey = `${slot.dayOfWeek}-${slot.startHour}`;
    if (seenSlots.has(uniqueKey)) {
        const dayLabel = DAYS_MAP.find((d) => d.value === slot.dayOfWeek)?.label;
        const timeLabel = formatFloatToTime(slot.startHour);
        setError(`لا يمكن إضافة مواعيد مكررة في نفس الوقت: يوم ${dayLabel} الساعة ${timeLabel}`);
        return;
    }
    seenSlots.add(uniqueKey);
    }

    setIsSubmitting(true);

    const apiPayload = slots.map((slot) => {
    // const dayLabel = DAYS_MAP.find((d) => d.value === slot.dayOfWeek)?.label || "الأحد";
    return {
        dayOfWeek: slot.dayOfWeek,
        startHour: slot.startHour,
        duration: slot.duration, // 👈 Map duration cleanly to payload
    };
    });

    try {
    const response = await fetch(`/api/manager/plan-variants/${variantId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: apiPayload }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "فشل تعديل الجدول");
    }

    mutate("/api/manager/plan-variants");
    setShow(false);
    } catch (err: unknown) {
    if(err instanceof Error) setError(err.message || "حدث خطأ في الشبكة");
    else setError("حدث خطأ في الشبكة");
    } finally {
    setIsSubmitting(false);
    }
};

return (
    <div className="fixed z-50 flex items-end sm:items-center justify-center inset-0 bg-black/20 backdrop-blur-sm">
    <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-t-[20px] sm:rounded-lg shadow-mid py-10 px-6 sm:p-5 w-full sm:w-[550px] space-y-4
        dark:border-t-8 dark:sm:border dark:border-secondary dark:bg-bg text-right text-textPrimary"
    >
        <h1 className="text-center font-bold text-h2 mb-1">تعديل مواعيد التمرين</h1>
        <p className="text-center text-xs text-textSecondary font-bold bg-grayBG dark:bg-bg py-1.5 rounded-md mb-4">
        الباقة: {variantName}
        </p>

        {error && (
        <p className="text-red-500 font-bold text-xs text-center bg-red-50 dark:bg-red-950/20 py-2 px-3 rounded-lg border border-red-200 dark:border-red-900 animate-pulse">
            {error}
        </p>
        )}

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {slots.map((slot, index) => (
            <div key={index} className="flex gap-2 items-center border-b pb-3 dark:border-slate-800">
            <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition mt-6"
            >
                <FaDeleteLeft className="w-5 h-5 hover:translate-x-1 transition" />
            </button> 

            {/* 2. Added Duration Selection Dropdown */}
            <div className="relative flex-1">
                <label className="block text-xs font-bold mb-1 text-textSecondary">المدة</label>
                <div className="relative">
                <select
                    value={slot.duration}
                    onChange={(e) => updateRow(index, "duration", Number(e.target.value))}
                    className="w-full px-3 py-1.5 pl-8 border border-textSecondary rounded-lg bg-surface text-sm appearance-none focus:outline-none"
                >
                    {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
                <FaChevronDown className="absolute text-textSecondary left-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" />
                </div>
            </div>

            <div className="flex-1">
                <label className="block text-xs font-bold mb-1 text-textSecondary">وقت البدء</label>
                <input
                type="number"
                step="0.5"
                min="0"
                max="23.5"
                value={slot.startHour}
                onChange={(e) => updateRow(index, "startHour", Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-textSecondary rounded-lg bg-surface text-sm focus:outline-none"
                />
            </div>

            <div className="relative flex-1">
                <label className="block text-xs font-bold mb-1 text-textSecondary">اليوم</label>
                <div className="relative">
                <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateRow(index, "dayOfWeek", Number(e.target.value))}
                    className="w-full px-3 py-1.5 pl-8 border border-textSecondary rounded-lg bg-surface text-sm appearance-none focus:outline-none"
                >
                    {DAYS_MAP.map((d) => (
                    <option key={d.value} value={d.value}>
                        {d.label}
                    </option>
                    ))}
                </select>
                <FaChevronDown className="absolute text-textSecondary left-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" />
                </div>
            </div>
            </div>
        ))}
        </div>

        <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs font-bold text-secondary hover:underline pt-2 focus:outline-none"
        >
        <FaPlus className="w-4 h-4" /> إضافة موعد آخر في الأسبوع
        </button>

        <div className="flex gap-5 items-center justify-center !mt-8">
        <button
            type="button"
            disabled={isSubmitting}
            className="outlined-button !text-textSecondary !border-textSecondary !px-10 !py-2 !rounded font-bold hover:!text-surface"
            onClick={() => setShow(false)}
        >
            إلغاء
        </button>
        <button
            type="submit"
            disabled={isSubmitting}
            className="filled-button !bg-secondary !px-10 !py-2 !rounded font-bold disabled:opacity-50"
        >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد التعديل"}
        </button>
        </div>
    </form>
    </div>
);
}
