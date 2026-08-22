"use client";

import { Arrow } from '@/icons';
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { CgSpinner } from 'react-icons/cg';
import UserAutocomplete from '../UserAutocomplete';
import { InvoiceStatus } from "@prisma/client";

interface InvoiceFormProps {
    setShow: Dispatch<SetStateAction<boolean>>;
}

interface UserListItem {
    id: string;
    fullName: string;
    email: string;
}

const InvoiceForm = ({ setShow }: InvoiceFormProps) => {
    const router = useRouter();

    // System States
    // const [isFetchingPlayers, setIsFetchingPlayers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Form Tracking Parameters
    const [formData, setFormData] = useState({
        customerId: "",
        customerName: "",
        reservationType: "appointment",
        amount: "",
        invoiceStatus: "unpaid",
    });


    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        // Client side guard check for un-registered names
        if (formData.customerId === "" && !formData.customerName.trim()) {
            setSubmitError("يرجى إدخال اسم الزبون العابر يدوياً لتسجيل المعاملة");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch("/api/manager/invoices/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "تعذر إنشاء الفاتورة");

            setShow(false);
            router.refresh();
        } catch (err: unknown) {
            if(err instanceof Error) setSubmitError(err.message || "حدث خطأ غير متوقع, الرجاء إعادة المحاولة");
            else setSubmitError("حدث خطأ غير متوقع, الرجاء إعادة المحاولة");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='fixed z-50 flex items-end sm:items-center justify-center inset-0 bg-black/40 backdrop-blur-sm p-4 animate-fadeIn'>
            <form
                onSubmit={handleSubmit}
                className='bg-surface rounded-t-[2rem] sm:rounded-lg shadow-mid py-10 px-6 sm:p-5 w-full sm:w-[400px] space-y-3
                [&>div>label]:font-bold [&>div>label]:text-small [&>div>label]:block [&>div>label]:mb-1 text-right
                dark:border-t-8 dark:sm:border dark:border-secondary dark:bg-bg'
            >
                <h1 className='text-center font-bold text-h2 mb-2 text-textPrimary'>
                    إنشاء فاتورة جديدة
                </h1>

                {submitError && (
                    <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold text-center border border-red-200">
                        ⚠️ {submitError}
                    </div>
                )}

                {/* Customer Dropdown */}
                <div className='relative'>
                    <UserAutocomplete
                        currentUserId={formData.customerId}
                        onUserSelect={(id : string) => handleInputChange("customerId", id)}
                    />
                </div>

                {/* Conditional Text Field for Manual Walk-In Guest Names */}
                {formData.customerId === "" && (
                    <div className="animate-fadeIn">
                        <label htmlFor="customerName" className="text-xs font-bold text-textSecondary block mb-1">
                            اسم الزبون الجديد (يدوياً)
                        </label>
                        <input
                            id="customerName"
                            type="text"
                            required
                            placeholder="أدخل الاسم الثلاثي للعميل الخارجي"
                            value={formData.customerName}
                            onChange={(e) => handleInputChange("customerName", e.target.value)}
                            className="w-full px-4 py-2 text-textPrimary bg-surface border border-textSecondary rounded-lg focus:outline-none focus:border-secondary text-right font-semibold text-sm"
                        />
                    </div>
                )}

                {/* Invoice Status */}
                <div className='relative'>
                    <label htmlFor="invoiceStatus">حالة الفاتورة</label>
                    <select
                        id='invoiceStatus'
                        value={formData.invoiceStatus}
                        disabled={isSubmitting}
                        onChange={(e) => handleInputChange("invoiceStatus", e.target.value)}
                        className='relative bg-surface w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg text-right focus:outline-none focus:border-secondary'
                    >
                        <option value="unpaid">⏳ بانتظار الدفع (ذمم معلقة)</option>
                        <option value="paid">💰 مدفوعة نقداً كاش</option>
                    </select>
                    <Arrow className='absolute text-textSecondary left-4 bottom-2.5 -translate-y-1/2 pointer-events-none' />
                </div>

                {/* Amount input */}
                <div>
                    <label htmlFor="amount">قيمة الفاتورة المطلوبة (ل.س)</label>
                    <input
                        id='amount'
                        type="number"
                        min="0"
                        required
                        placeholder="أدخل قيمة المبلغ الإجمالي"
                        disabled={isSubmitting}
                        value={formData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                        className='w-full px-4 py-2 text-textPrimary bg-surface border border-textSecondary rounded-lg focus:outline-none focus:border-secondary text-right font-semibold'
                    />
                </div>

                {/* Actions Footer Container */}
                <div className="flex gap-4 items-center justify-center pt-6">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        className='flex-1 outlined-button !text-textSecondary !border-textSecondary !py-2 !rounded font-bold hover:!bg-textSecondary hover:!text-white transition disabled:opacity-50'
                        onClick={() => setShow(false)}
                    >
                        إلغاء
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className='flex-1 filled-button !bg-secondary !py-2 !rounded font-bold text-white flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50'
                    >
                        {isSubmitting && <CgSpinner className="animate-spin text-lead" />}
                        إنشاء الفاتورة
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;
