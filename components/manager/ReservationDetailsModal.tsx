"use client";

import React, { useState } from "react";
import { useSWRConfig } from "swr";
import { Check, Cancel } from "@/icons"; // Adjust according to your icons folder path
import { ReservationWithInvoiceAndUser } from "@/types";

interface ReservationDetailsModalProps {
reservation: ReservationWithInvoiceAndUser;
onClose: () => void;
}

export default function ReservationDetailsModal({
reservation,
onClose,
}: ReservationDetailsModalProps) {
const { mutate } = useSWRConfig();
const [isUpdating, setIsUpdating] = useState(false);
const [modalError, setModalError] = useState<string | null>(null);
const [currentStatus, setCurrentStatus] = useState(reservation.invoice?.status || "UNPAID");

const handleStatusChange = async (newStatus: "PAID" | "UNPAID", id: string) => {
    const confirmPayment = window.confirm("هل أنت متأكد من تغيير حالة هذه الفاتورة إلى مدفوعة؟");
    if (!confirmPayment) return;

    setIsUpdating(true);
    setModalError(null);

    try {
    const response = await fetch(`/api/manager/invoices/${reservation.invoice?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();

    if (!response.ok) {
        setModalError(data.error || "فشل تعديل حالة الفاتورة");
        return;
    }

    // Revalidate cache to instantly refresh parent calendar dataset keys
    mutate((key) => typeof key === "string" && key.startsWith("/api/manager/reservations"));
    setCurrentStatus(newStatus);
    } catch (err) {
    console.error(err);
    setModalError("حدث خطأ في الشبكة، يرجى المحاولة لاحقاً");
    } finally {
    setIsUpdating(false);
    }
};

const handleCancelReservation = async (reservationId: string) => {
    const confirmCancel = window.confirm("هل أنت متأكد من رغبتك في إلغاء وحذف هذا الحجز نهائياً؟");
    if (!confirmCancel) return;

    setIsUpdating(true);
    setModalError(null);

    try {
    const response = await fetch(`/api/manager/reservations/${reservationId}`, {
        method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
        setModalError(data.error || "فشل إلغاء الحجز من النظام");
        return;
    }

    mutate((key) => typeof key === "string" && key.startsWith("/api/manager/reservations"));
    onClose(); // Safely dismiss modal panel on removal success
    } catch (err) {
    console.error(err);
    setModalError("حدث خطأ أثناء الاتصال بالخادم لإلغاء الحجز");
    } finally {
    setIsUpdating(false);
    }
};

return (
    <div className="fixed z-50 flex items-center justify-center inset-0 bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
    <div className="relative bg-surface rounded-xl shadow-mid p-6 w-full sm:w-[420px] text-right text-textPrimary border dark:border-secondary space-y-4">
        
        {/* <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
        <button 
            type="button" 
            onClick={onClose}
            className="text-textSecondary text-lg font-bold hover:text-textPrimary"
        >
            ✕
        </button>
        <h2 className="font-bold text-lead text-secondary">تفاصيل الحجز بالكامل</h2>
        </div> */}

        {modalError && (
        <p className="text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs text-center border border-red-200">
            {modalError}
        </p>
        )}

        <div className="space-y-3 text-sm md:text-base">
        <div className="mb-4">
            <p className="font-bold text-h3 text-center text-textPrimary">
            {reservation.isSubscription ? (reservation.planVariant?.displayName || "مجموعة مشتركة") : reservation.user?.fullName}
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-grayBG dark:bg-bg p-3 rounded-lg text-center">
            <div>
            <span className="text-textSecondary font-bold text-xs block mb-0.5">التاريخ</span>
            <p className="font-semibold">{new Date(reservation.date).toLocaleDateString("ar-SY")}</p>
            </div>
            <div>
            <span className="text-textSecondary font-bold text-xs block mb-0.5">وقت البدء</span>
            <p className="font-semibold">
                {reservation.startHour === 12 ? "12:00 م" : reservation.startHour < 12 ? `${reservation.startHour}:00 ص` : `${reservation.startHour - 12}:00 م`}
            </p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-2 dark:border-textSecondary ">
            <p><span className="font-bold text-textSecondary">المدة:</span> {reservation.duration} دقيقة</p>
            <p><span className="font-bold text-textSecondary">رقم الطاولة:</span> الطاولة {reservation.table}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-b pb-2 dark:border-textSecondary">
            <p className="flex gap-2 items-start">
            <span>{reservation.withCoach ? <Check className="text-accent"/> : <Cancel/>}</span>
            <span className="text-textSecondary font-bold">مع مدرب</span>
            </p>
            <p className="flex gap-2 items-start ">
            <span>{reservation.withPaddles ? <Check className="text-accent"/> : <Cancel/>}</span>
            <span className="text-textSecondary font-bold">مع مضارب</span>
            </p>
        </div>

        {reservation.isSubscription ? null : (
            currentStatus === "UNPAID" ? (
            <p className="flex justify-center gap-2">
                <span className="text-textSecondary font-bold">المبلغ المستحق:</span>
                <span className="font-bold text-amber">
                {reservation.invoice ? `${reservation.invoice.amount.toLocaleString()} ل.س` : "باقة اشتراك"}
                </span>
            </p>
            ) : (
            <p className="flex justify-center gap-2">
                <span className="text-textSecondary font-bold">قيمة الفاتورة :</span>
                <span className="font-bold text-accent">
                {reservation.invoice ? `${reservation.invoice.amount.toLocaleString()} ل.س` : "باقة اشتراك"}
                </span>
            </p>
            )
        )}
        </div>

        {/* Action button rows */}
        <div className=" space-y-2">
        {currentStatus === "UNPAID" && !reservation.isSubscription && (
            <div className="flex justify-center items-center gap-3 w-full">
            <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleCancelReservation(reservation.id)}
                className="flex-1 outlined-button !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white !py-2 !px-6 !rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
                🗑️ إلغاء الحجز
            </button>

            <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange("PAID", reservation.invoice?.id || "")}
                className="flex-1 filled-button !py-2.5 !px-6 !bg-accent hover:opacity-90 rounded-lg text-sm font-bold text-white disabled:opacity-50 transition"
            >
                {isUpdating ? "جاري الحفظ..." : "💰 تأكيد الدفع"}
            </button>
            </div>
        )}

        {/* Fallback cancel option if invoice status is already PAID */}
        {currentStatus === "PAID" && (
            <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleCancelReservation(reservation.id)}
            className="w-full outlined-button !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white !py-2 !rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
            🗑️ إلغاء هذا الحجز بالكامل من النظام
            </button>
        )}

        <button
            type="button"
            onClick={onClose}
            className="w-full filled-button !py-2 !bg-textSecondary hover:opacity-90 rounded-lg text-sm font-bold text-white block text-center"
        >
            إغلاق النافذة
        </button>
        </div>

    </div>
    </div>
);
}
