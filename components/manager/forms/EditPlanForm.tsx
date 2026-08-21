"use client";

import { Arrow } from '@/icons';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { SubscriptionPlan } from "@/app/generated/prisma/client";

// Define the shape of the plan to be updated

interface EditPlanFormProps {
plan: SubscriptionPlan; // 👈 Expects the plan to pre-populate values
setShow: Dispatch<SetStateAction<boolean>>;
onPlanUpdated?: () => void; // 👈 Callback containing your SWR mutate reference
}

const EditPlanForm = ({ plan, setShow, onPlanUpdated }: EditPlanFormProps) => {
const [formData, setFormData] = useState({
    name: plan.name,
    classesPerWeek: plan.classesPerWeek,
    monthlyPrice: plan.monthlyPrice,
    withPaddles: plan.withPaddles,
    withCoach: plan.withCoach,
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({
    ...prev,
    [key]: value,
    }));
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
    // Direct call targeting your dynamic PATCH route handler
    const response = await fetch(`/api/manager/subscription-plans/${plan.id}`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "حدث خطأ غير متوقع أثناء تحديث البيانات");
    }

    console.log("Plan updated successfully:", result);

    // Trigger SWR revalidation on the parent Swiper component
    if (onPlanUpdated) {
        onPlanUpdated();
    }

    setShow(false); // Close the form modal overlay
    } catch (err: unknown) {
    if(err instanceof Error) setError(err.message || "فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    else setError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    
    } finally {
    setIsSubmitting(false);
    }
};

return (
    <div className='fixed z-50 flex items-end sm:items-center justify-center inset-0 bg-black/20 backdrop-blur-sm'>
    <form
        onSubmit={handleSubmit}
        className='bg-surface rounded-t-[20%] sm:rounded-lg shadow-mid py-10 px-6 sm:p-5 w-full sm:w-[400px] space-y-4
        [&>div>label]:font-bold [&>div>label]:text-small [&>div>label]:block [&>div>label]:mb-1
        dark:border-t-8 dark:sm:border dark:border-secondary dark:bg-bg text-right'
    >
        <h1 className='text-center font-bold text-h2 mb-2'>
        تعديل باقة الاشتراك
        </h1>

        {error && (
        <p className="text-red-500 font-bold bg-red-50 p-2 rounded text-xs text-center">
            {error}
        </p>
        )}

        {/* Plan Name */}
        <div>
        <label htmlFor="name">اسم الباقة</label>
        <input
            id='name'
            type="text"
            required
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="مثال: الباقة الاحترافية"
            className='w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg !shadow-none bg-surface focus:outline-none'
        />
        </div>

        {/* Classes Per Week */}
        <div className='relative'>
        <label htmlFor="classesPerWeek">عدد الجلسات الأسبوعية</label>
        <select
            id='classesPerWeek'
            value={formData.classesPerWeek}
            onChange={(e) => updateField("classesPerWeek", Number(e.target.value))}
            className='relative bg-surface w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg appearance-none focus:outline-none'
        >
            <option value={1}>جلسة واحدة أسبوعياً</option>
            <option value={2}>جلستين أسبوعياً</option>
            <option value={3}>3 جلسات أسبوعياً</option>
            <option value={4}>4 جلسات أسبوعياً</option>
            <option value={5}>5 جلسات أسبوعياً</option>
        </select>
        <Arrow className='absolute text-textSecondary left-4 bottom-2 -translate-y-1/2 pointer-events-none' />
        </div>

        {/* Monthly Price */}
        <div>
        <label htmlFor="monthlyPrice">قيمة الاشتراك الشهري (ل.س)</label>
        <input
            id='monthlyPrice'
            type="number"
            min="0"
            required
            value={formData.monthlyPrice}
            onChange={(e) => updateField("monthlyPrice", Number(e.target.value))}
            placeholder="أدخل قيمة الاشتراك"
            className='w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg !shadow-none bg-surface focus:outline-none'
        />
        </div>
             <div className="flex gap-4 !mt-4">
        <div className="flex gap-2 items-center justify-between">
            <button
            id="withCoach"
            type="button"
            onClick={() => updateField("withCoach", !formData.withCoach)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.withCoach ? "bg-secondary" : "bg-gray-100"
            }`}
            role="switch"
            aria-checked={formData.withCoach}
            >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition ${formData.withCoach ? "-translate-x-6" : "-translate-x-1"}`} />
            </button>
            <label htmlFor="withCoach" className="text-small font-bold">مع مدرب</label>
        </div>

        <div className="flex gap-2 items-center justify-between">
            <button
            id="withPaddles"
            type="button"
            onClick={() => updateField("withPaddles", !formData.withPaddles)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.withPaddles ? "bg-secondary" : "bg-gray-100"
            }`}
            role="switch"
            aria-checked={formData.withPaddles}
            >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition ${formData.withPaddles ? "-translate-x-6" : "-translate-x-1"}`} />
            </button>
            <label htmlFor="withPaddles" className="text-small font-bold">مع مضارب</label>
        </div>
        </div>



        {/* Actions buttons container */}
        <div className="flex gap-5 items-center justify-center !mt-10">
        <button
            type="button"
            disabled={isSubmitting}
            className='outlined-button !text-textSecondary !border-textSecondary !px-10 !py-2 !rounded font-bold hover:!text-surface disabled:opacity-50'
            onClick={() => setShow(false)}
        >
            إلغاء
        </button>

        <button
            type="submit"
            disabled={isSubmitting}
            className='filled-button !bg-secondary !px-10 !py-2 !rounded font-bold disabled:opacity-50'
        >
            {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
        </div>
    </form>
    </div>
);
};

export default EditPlanForm;
