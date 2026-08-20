"use client";

import { Arrow } from "@/icons";
import React, { useState,useEffect, Dispatch, SetStateAction } from "react";
import HourSelector from "@/components/player/HourSelector";
import UserAutocomplete from "@/components/manager/UserAutocomplete";

interface ReservationFormProps {
setShow: Dispatch<SetStateAction<boolean>>;
onReservationAdded?: () => void;
}
const ARABIC_TABLE_NAMES = [
    "الأولى",
    "الثانية",
    "الثالثة",
    "الرابعة",
    "الخامسة",
    "السادسة",
    "السابعة",
    "الثامنة",
    "التاسعة",
    "العاشرة"
];

type ReservationStatus = "PAID" | "UNPAID";

const ReservationForm = ({ setShow , onReservationAdded }: ReservationFormProps) => {
const [availableHours, setAvailableHours] = useState<number[]>([]);
const [loadingHours, setLoadingHours] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [showOverridePrompt, setShowOverridePrompt] = useState(false);
const [debtDetails, setDebtDetails] = useState<{ current: number; max: number } | null>(null);
const [totalTablesCount, setTotalTablesCount] = useState<number>(2); // Default fallback safe value

useEffect(() => {
async function loadVenueSettings() {
    try {
    const res = await fetch("/api/manager/settings");
    if (res.ok) {
        console.log("tables number is ", res)
        const data = await res.json();
        setTotalTablesCount(data.totalTables || 2);
    }
    } catch (err) {
    console.error("Failed loading venue configuration settings:", err);
    }
}
loadVenueSettings();
}, []);

const [formData, setFormData] = useState({
    userID: "",
    table: "1",
    date: "",
    startHour: 16,
    duration: 60,
    status: "UNPAID" as ReservationStatus,
    withCoach: false,
    withPaddles: true,
});

const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
) => {
    setFormData((prev) => ({
    ...prev,
    [key]: value,
    }));
    if (key === "userID") {
        setShowOverridePrompt(false);
        setError(null);
    }
};
useEffect(() => {
    if (!formData.date || !formData.table) {
    setAvailableHours([]);
    return;
    }

    // Guard: If selected date is in the past, stop execution immediately
    const selected = new Date(formData.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    
    if (selected < today) {
        setAvailableHours([]);
        setError("التاريخ غير صالح")
        return;
    }

    const fetchAvailableHours = async () => {
    setLoadingHours(true);
    try {
        const response = await fetch(
        `/api/player/reservations/available-hours?date=${formData.date}&table=${formData.table}&duration=${formData.duration}`
        );
        if (response.ok) {
        const hours: number[] = await response.json();
        setAvailableHours(hours);
        
        // Auto-select the first available hour if current selection isn't optionable
        if (hours.length > 0 && !hours.includes(formData.startHour)) {
            updateField("startHour", hours[0]);
        }
        }
    } catch (error) {
        console.error("Failed to load available hours", error);
    } finally {
        setLoadingHours(false);
    }
    };

    fetchAvailableHours();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [formData.date, formData.table, formData.duration]);




const executeSubmit = async (forceOverride = false) => {
    setError(null);
    setIsSubmitting(true);

    try {
    const response = await fetch("/api/manager/reservations/new", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, force: forceOverride }), 
    });

    const result = await response.json();

    if (!response.ok) {
        setError(result.error || "حدث خطأ ما أثناء حفظ الحجز");
        setIsSubmitting(false);
        return;
    }

    // 👈 Player is over the limit prompt handler condition trigger
    if (result.hasExceededLimit) {
        setDebtDetails({ current: result.currentDebt, max: result.allowedLimit });
        setShowOverridePrompt(true);
        setIsSubmitting(false);
        return;
    }

    if (onReservationAdded) {
        onReservationAdded(); 
    }
    setShow(false);
    } catch (err: unknown) {
    console.error("Failed to save reservation:", err);
    setError("فشل الاتصال بالخادم");
    } finally {
    setIsSubmitting(false);
    }
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeSubmit(false); // First submission attempt without forcing an override
};

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Add leading zero
    const day = String(today.getDate()).padStart(2, "0");        // Add leading zero
    return `${year}-${month}-${day}`;
}; 


return (
    <div className="fixed z-50 flex items-end sm:items-center justify-center inset-0 bg-black/20 backdrop-blur-sm">
    <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-t-[20%] sm:rounded-lg shadow-mid py-10 px-6 sm:p-5 w-full sm:w-[400px] space-y-2
        [&>div>label]:font-bold [&>div>label]:text-small [&>div>label]:block [&>div>label]:mb-1
        dark:border-t-8 dark:sm:border dark:border-secondary dark:bg-bg"
    >
        <h1 className="text-center font-bold text-h2 mb-2">
        احجز حصة جديدة
        </h1>

        <div>
            {/* <UserAutocomplete
                currentUserId={formData.userID}
                onUserSelect={(userId) => updateField("userID", userId)}
            /> */}
            <UserAutocomplete
                currentUserId={formData.userID}
                onUserSelect={(userId) => updateField("userID", userId)}
            />
        </div>

        {/* Table */}
        <div className="relative">
        <label htmlFor="table">الطاولة</label>

        <select
            id="table"
            value={formData.table}
            onChange={(e) => updateField("table", e.target.value)}
            className="relative w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface"
        >
            {Array.from({ length: totalTablesCount }, (_, index) => {
                const tableValue = index + 1;
                // Fallback gracefully to standard numerical text notation if total tables exceed 10 slots
                const arabicLabel = ARABIC_TABLE_NAMES[index] || `الطاولة رقم ${tableValue}`;

                return (
                <option key={tableValue} value={tableValue}>
                    {arabicLabel}
                </option>
                );
            })}
        </select>

        <Arrow className="absolute text-textSecondary left-4 bottom-2 -translate-y-1/2 pointer-events-none" />
        </div>

                {/* Duration */}
        <div className="relative">
        <label htmlFor="duration">المدة</label>

        <select
            id="duration"
            value={formData.duration}
            onChange={(e) =>
            updateField("duration", Number(e.target.value))
            }
            className="relative bg-surface w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg"
        >
            <option value={30}>30 دقيقة</option>
            <option value={60}>60 دقيقة</option>
            <option value={90}>90 دقيقة</option>
            <option value={120}>120 دقيقة</option>
        </select>

        <Arrow className="absolute text-textSecondary left-4 bottom-2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Date */}
        <div>
        <label htmlFor="day">اليوم</label>

        <input
            id="day"
            type="date"
            value={formData.date}
            min={getTodayString()}
            onChange={(e) => updateField("date", e.target.value)}
            className="relative appearance-none w-full px-4 py-2 
            text-textSecondary border border-textSecondary rounded-lg !shadow-none"
        />
        </div>

        {/* Start Hour */}
        <div>
        {loadingHours ? (
            <p className="text-small text-textSecondary text-center py-2">جاري تحميل الأوقات المتاحة...</p>
        ) : formData.date ? (
            availableHours.length > 0 ? (
            <HourSelector
                value={formData.startHour}
                availableHours={availableHours} 
                onChange={(hour: number) => updateField("startHour", hour)}
            />
            ) : (
            <p className="text-small text-red-500 font-bold text-center py-2">لا توجد ساعات متاحة لهذا اليوم</p>
            )
        ) : (
            <p className="text-small text-textSecondary text-center py-2">يرجى تحديد اليوم لرؤية الأوقات المتاحة</p>
        )}
        </div>



        {/* Status */}
        <div className="relative">
        <label htmlFor="status">الحالة</label>

        <select
            id="status"
            value={formData.status}
            onChange={(e) =>
            updateField(
                "status",
                e.target.value as ReservationStatus
            )
            }
            className="relative bg-surface w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg"
        >
            <option value="UNPAID">غير مدفوعة</option>
            <option value="PAID">مدفوعة</option>
        </select>

        <Arrow className="absolute text-textSecondary left-4 bottom-2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Toggles */}
        <div className="flex gap-4 !mt-4">
        {/* Coach */}
        <div className="flex gap-2 items-center justify-between">
            <button
            id="withCoach"
            type="button"
            onClick={() =>
                updateField("withCoach", !formData.withCoach)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.withCoach
                ? "bg-secondary"
                : "bg-gray-100"
            }`}
            role="switch"
            aria-checked={formData.withCoach}
            >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-surface transition ${
                formData.withCoach
                    ? "-translate-x-6"
                    : "-translate-x-1"
                }`}
            />
            </button>

            <label
            htmlFor="withCoach"
            className="text-small font-bold"
            >
            مع مدرب
            </label>
        </div>

        {/* Paddles */}
        <div className="flex gap-2 items-center justify-between">
            <button
            id="withPaddles"
            type="button"
            onClick={() =>
                updateField(
                "withPaddles",
                !formData.withPaddles
                )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.withPaddles
                ? "bg-secondary"
                : "bg-gray-100"
            }`}
            role="switch"
            aria-checked={formData.withPaddles}
            >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-surface transition ${
                formData.withPaddles
                    ? "-translate-x-6"
                    : "-translate-x-1"
                }`}
            />
            </button>

            <label
            htmlFor="withPaddles"
            className="text-small font-bold"
            >
            مع مضارب
            </label>
        </div>
        </div>


        {showOverridePrompt && debtDetails && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 rounded-lg font-medium text-center my-6">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
            ⚠️ تنبيه المشرف: ذمة اللاعب الحالية ({debtDetails.current.toLocaleString()} ل.س) تتجاوز الحد المسموح به لجدولة مواعيد جديدة ({debtDetails.max.toLocaleString()} ل.س).
            </p>
            <div className="flex gap-2 justify-end mt-2">
            <button
                type="button"
                onClick={() => setShowOverridePrompt(false)}
                className="!px-3  filled-button !text-small !flex !items-center"
            >
                إلغاء الحجز
            </button>
            <button
                type="button"
                onClick={() => executeSubmit(true)} // Retriggers fetch request with force set to true
                className="px-2 !pt-1 filled-button !text-meta !bg-amber w-2/3"
            >
                تجاوز الحد وحفظ الحجز على مسؤوليتي
            </button>
            </div>
        </div>
        )}

        {/* Actions */}
        <div className="flex gap-5 items-center justify-center !mt-10">
        <button
            type="button"
            onClick={() => setShow(false)}
            className="outlined-button !text-textSecondary !border-textSecondary !px-10 !py-2 !rounded font-bold hover:!text-surface"
        >
            إلغاء
        </button>

        <button
            type="submit"
            disabled={isSubmitting}
            className="filled-button !bg-secondary !px-10 !py-2 !rounded font-bold disabled:opacity-50"
        >
            حجز الحصة
        </button>
        </div>
    </form>
    </div>
);
};

export default ReservationForm;