"use client";

import React, { useState } from "react";
import { useSWRConfig } from "swr";
import UserAutocomplete from "../UserAutocomplete";
import { Arrow } from "@/icons";

interface AddPlayerToGroupFormProps {
planVariantId: string;    // 👈 Sourced directly from variant slot row contextual trigger
planVariantName: string;  // 👈 Sourced directly (e.g. "الباقة الاحترافية - تحت 13 سنة")
setShow: (show: boolean) => void;
}

export default function AddPlayerToGroupForm({
planVariantId,
planVariantName,
setShow,
}: AddPlayerToGroupFormProps) {
const { mutate } = useSWRConfig();

const [formData, setFormData] = useState({
    userId: "",
    monthsDuration: "1",
    invoiceStatus: "UNPAID",
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.userId) {
    setError("يرجى اختيار لاعب من قائمة البحث");
    setIsSubmitting(false);
    return;
    }

    try {
    // 👈 Send payload directly with planVariantId mapping parameters
    const response = await fetch("/api/manager/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        userId: formData.userId,
        planVariantId: planVariantId, 
        monthsDuration: Number(formData.monthsDuration),
        invoiceStatus: formData.invoiceStatus,
        }),
    });

    const result = await response.json();

    // 🎯 FIXED: Direct return state assignment protects application from development overlays
    if (!response.ok) {
        setError(result.error || "حدث خطأ ما أثناء إتمام الاشتراك");
        setIsSubmitting(false);
        return;
    }

    console.log("Player registered successfully:", result);

    // Revalidate cache to redraw group tables instantly
    mutate("/api/manager/plan-variants");
    setShow(false); 
    } catch (err: unknown) {
    console.error(err);
    setError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
    setIsSubmitting(false);
    }
};

return (
    <div className="fixed z-50 flex items-end sm:items-center justify-center inset-0 bg-black/20 backdrop-blur-sm p-4">
    <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-t-[20px] sm:rounded-lg shadow-mid py-10 px-6 sm:p-5 w-full sm:w-[400px] space-y-4
        [&>div>label]:font-bold [&>div>label]:text-small [&>div>label]:block [&>div>label]:mb-1
        dark:border-t-8 dark:sm:border dark:border-secondary dark:bg-bg text-right text-textPrimary"
    >
        <h1 className="text-center font-bold text-h2 mb-1">إضافة لاعب جديد للمجموعة</h1>
        <p className="text-center text-xs text-textSecondary font-bold bg-grayBG dark:bg-bg py-1.5 rounded-md mb-4">
        الباقة: {planVariantName}
        </p>

        {error && (
        <p className="text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs text-center border border-red-200 dark:border-red-900">
            {error}
        </p>
        )}

        {/* 1. AUTOCOMPLETE PLAYER SEARCH */}
        <div>
        <UserAutocomplete
            currentUserId={formData.userId}
            onUserSelect={(id) => updateField("userId", id)}
        />
        </div>

        {/* 2. SUBSCRIPTION DURATION */}
        <div className="relative">
        <label htmlFor="monthsDuration">مدة الاشتراك</label>
        <select
            id="monthsDuration"
            value={formData.monthsDuration}
            onChange={(e) => updateField("monthsDuration", e.target.value)}
            className="relative bg-surface w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg appearance-none focus:outline-none"
        >
            <option value="1">شهر واحد</option>
            <option value="2">شهران</option>
            <option value="3">3 أشهر</option>
            <option value="6">6 أشهر</option>
            <option value="12">سنة كاملة (12 شهر)</option>
        </select>
        <Arrow className="absolute text-textSecondary left-4 bottom-2 -translate-y-1/2 pointer-events-none w-4 h-4" />
        </div>

        {/* 3. INITIAL INVOICE STATUS */}
        <div className="relative">
        <label htmlFor="invoiceStatus">حالة دفعة الفاتورة الأولى</label>
        <select
            id="invoiceStatus"
            value={formData.invoiceStatus}
            onChange={(e) => updateField("invoiceStatus", e.target.value)}
            className="relative bg-surface w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg appearance-none focus:outline-none"
        >
            <option value="UNPAID">مستحقة الدفع (غير مدفوعة)</option>
            <option value="PAID">مدفوعة ومسددة بالكامل للمشرف</option>
        </select>
        <Arrow className="absolute text-textSecondary left-4 bottom-2 -translate-y-1/2 pointer-events-none w-4 h-4" />
        </div>

        {/* Action Controls */}
        <div className="flex gap-5 items-center justify-center pt-4">
        <button
            type="button"
            disabled={isSubmitting}
            className="outlined-button !text-textSecondary !border-textSecondary !px-10 !py-2 !rounded-lg font-bold hover:!text-surface disabled:opacity-50"
            onClick={() => setShow(false)}
        >
            إلغاء
        </button>

        <button
            type="submit"
            disabled={isSubmitting || !formData.userId}
            className="filled-button !bg-secondary !px-10 !py-2 !rounded-lg font-bold disabled:opacity-50"
        >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد الإضافة"}
        </button>
        </div>
    </form>
    </div>
);
}
