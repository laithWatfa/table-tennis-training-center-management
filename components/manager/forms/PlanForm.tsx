"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { useSWRConfig } from "swr"; // Import global cache config hook

interface PlanFormProps {
setShow: Dispatch<SetStateAction<boolean>>;
}

const PlanForm = ({ setShow }: PlanFormProps) => {
const { mutate } = useSWRConfig(); // Extract the global cache mutator

const [formData, setFormData] = useState({
    name: "",
    classesPerWeek: 1,
    monthlyPrice: "",
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simple validation guard
    if (!formData.name.trim() || !formData.monthlyPrice) {
    setError("يرجى ملء جميع الحقول المطلوبة");
    setIsSubmitting(false);
    return;
    }

    try {
    const response = await fetch("/api/manager/subscription-plans", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        name: formData.name,
        classesPerWeek: formData.classesPerWeek,
        monthlyPrice: Number(formData.monthlyPrice),
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "حدث خطأ ما أثناء حفظ البيانات");
    }

    console.log("Plan added successfully:", result);

    // Trigger dynamic global cache refresh for your Swiper component endpoint key
    mutate("/api/manager/subscription-plans");
    
    setShow(false); // Close the form modal sheet overlay canvas
    } catch (err: unknown) {
    if(err instanceof Error) setError(err.message || "فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    else setError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
    setIsSubmitting(false);
    }
};

return (
    <div className="fixed z-50 flex items-end sm:items-center justify-center inset-0 bg-black/20 backdrop-blur-sm">
    <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-t-[20%] sm:rounded-lg shadow-mid py-10 px-6 sm:p-5 w-full sm:w-[400px] space-y-3
        [&>div>label]:font-bold [&>div>label]:text-small [&>div>label]:block [&>div>label]:mb-1
        dark:border-t-8 dark:sm:border dark:border-secondary dark:bg-bg text-right"
    >
        <h1 className="text-center font-bold text-h2 mb-4">إنشاء خطة جديدة</h1>

        {/* Error Notification Alert Banner */}
        {error && (
        <p className="text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs text-center">
            {error}
        </p>
        )}

        {/* Plan Name */}
        <div>
        <label htmlFor="name">اسم الخطة</label>
        <input
            id="name"
            type="text"
            required
            placeholder="الخطة الأساسية"
            value={formData.name}
            onChange={(e) =>
            setFormData((prev) => ({
                ...prev,
                name: e.target.value,
            }))
            }
            className="w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface focus:outline-none !shadow-none"
        />
        </div>

        {/* Classes Per Week */}
        <div>
        <label htmlFor="classesPerWeek">عدد الحصص أسبوعياً</label>
        <input
            id="classesPerWeek"
            type="number"
            min="1"
            required
            placeholder="3"
            value={formData.classesPerWeek}
            onChange={(e) =>
            setFormData((prev) => ({
                ...prev,
                classesPerWeek: Math.max(1, Number(e.target.value)),
            }))
            }
            className="w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface focus:outline-none !shadow-none"
        />
        </div>

        {/* Monthly Price */}
        <div>
        <label htmlFor="monthlyPrice">السعر الشهري (ل.س)</label>
        <input
            id="monthlyPrice"
            type="number"
            min="0"
            required
            placeholder="50000"
            value={formData.monthlyPrice}
            onChange={(e) =>
            setFormData((prev) => ({
                ...prev,
                monthlyPrice: e.target.value,
            }))
            }
            className="w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface focus:outline-none !shadow-none"
        />
        </div>

        {/* Actions button container handles */}
        <div className="flex gap-5 items-center justify-center !mt-10">
        <button
            type="button"
            disabled={isSubmitting}
            className="outlined-button !text-textSecondary !border-textSecondary !px-10 !py-2 !rounded font-bold hover:!text-surface disabled:opacity-50"
            onClick={() => setShow(false)}
        >
            إلغاء
        </button>

        <button
            type="submit"
            disabled={isSubmitting}
            className="filled-button !bg-secondary !px-10 !py-2 !rounded font-bold disabled:opacity-50"
        >
            {isSubmitting ? "جاري الإضافة..." : "إضافة الخطة"}
        </button>
        </div>
    </form>
    </div>
);
};

export default PlanForm;
