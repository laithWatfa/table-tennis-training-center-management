"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CgArrowRight, CgSpinner } from "react-icons/cg";
import { Bills, Reservation } from "@/icons";
import { FaTrashAlt as Cancel } from "react-icons/fa";
import { useRouter } from "next/navigation"; 
import EditPlayerCredentials from "@/components/manager/forms/EditPlayerCredentials";

interface DetailedPlayerProfile {
fullName: string;
email: string;
role: string;
dateOfBirth: string | null;
invoices: Array<{ id: string; amount: number; status: string; createdAt: string }>;
reservations: Array<{ id: string; date: string; startHour: number; duration: number; table: number }>;
}

export default function PlayerProfileDetailsPage() {
const params = useParams();
const playerId = params.id as string;

const [profile, setProfile] = useState<DetailedPlayerProfile | null>(null);
const [isLoading, setIsLoading] = useState(true);
const router = useRouter();
const [isDeleting, setIsDeleting] = useState(false);

const handleDeletePlayer = async () => {
const primaryConfirm = window.confirm(`⚠️ تحذير شديد: هل أنت متأكد من رغبتك في حذف اللاعب "${profile?.fullName}" نهائياً من النظام؟\nسيؤدي هذا الإجراء إلى حذف كافة حجوزاته، باقاته، وفواتيره بالكامل ولا يمكن التراجع عنه!`);
if (!primaryConfirm) return;

const doubleCheckConfirm = window.confirm("هل أنت متأكد تماماً للمرة الأخيرة؟ سيتم مسح كافة البيانات المالية المرتبطة بهذا العضو فوراً.");
if (!doubleCheckConfirm) return;

setIsDeleting(true);
try {
    const res = await fetch(`/api/manager/players/${playerId}/delete`, {
    method: "DELETE"
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل إتمام عملية حذف العضو");

    alert(data.message || "تم حذف الحساب بنجاح");
    
    // Redirect management team safely back to the directory grid listing screen
    router.push("/manager/players");
    router.refresh();
} catch (err: unknown) {
    if(err instanceof Error) alert(err.message || "حدث خطأ أثناء محاولة الاتصال بالخادم");
    else alert("حدث خطأ أثناء محاولة الاتصال بالخادم");
    setIsDeleting(false);
}
};

// Separate client side data resolver for the profile context data array
useEffect(() => {
    async function loadFullProfile() {
    try {
        const res = await fetch(`/api/manager/players/${playerId}`);
        if (res.ok) {
        const data = await res.json();
        setProfile(data);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
    }
    loadFullProfile();
}, [playerId]);

if (isLoading) {
    return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-textSecondary gap-2">
        <CgSpinner className="animate-spin text-h1 text-secondary" />
        <p className="font-semibold">جاري تحميل السجل الكامل للاعب...</p>
    </div>
    );
}

if (!profile) {
    return (
    <div className="text-center p-8 text-red-500 font-bold">
        ⚠️ الحساب المطلوب غير موجود أو تعذر تحميل ملف البيانات الخاص به.
    </div>
    );
}

const outstandingDebt = profile.invoices
    .filter(inv => inv.status === "UNPAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

return (
    <div className="space-y-6 w-full max-w-5xl mx-auto px-1 text-right">
    

        <div className="w-full md:w-auto flex justify-between ">
                    {/* Return Navigation Anchor Link */}
                <Link href="/manager/players" className="text-xs font-bold text-textSecondary flex items-center gap-1 hover:text-textPrimary  mb-2">
                    <CgArrowRight />
                    العودة لدليل اللاعبين 
                </Link>
            <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeletePlayer}
                className="outlined-button !items-center gap-2 !border-red-500 !text-red-500 hover:!bg-red-500 
                hover:!text-white !py-1.5 !px-5 !rounded-lg text-xs font-bold  transition disabled:opacity-40"
            >
                {isDeleting ? "جاري حذف الحساب..." :  <> <Cancel/>حذف اللاعب نهائياً</>}
            </button>
        </div>

    {/* Top Banner Card Summary */}
    <div className="bg-surface rounded-xl p-6 border dark:border-textSecondary flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-center w-full md:text-right md:w-fit">
            <h1 className="text-h2 font-bold text-textPrimary">{profile.fullName}</h1>
            <p className="text-xs text-textSecondary mt-0.5 font-sans" dir="ltr">{profile.email}</p>
        </div>



        <div className="bg-grayBG dark:bg-bg/40 p-4 rounded-xl text-center w-full md:w-auto border dark:border-slate-800">
            <span className="text-xs font-bold text-textSecondary block mb-1">الرصيد المطلوب المعلق</span>
            <p className={`text-lead font-bold ${outstandingDebt > 0 ? "text-red-500" : "text-accent"}`}>
                {outstandingDebt.toLocaleString()} ل.س
            </p>
        </div>

    </div>

    <div className="md:col-span-2 lg:col-span-1">
        <EditPlayerCredentials 
            playerId={playerId}
            initialEmail={profile.email}
            // Safely convert date to clean ISO string input standard YYYY-MM-DD layout standard compatibility
            initialDob={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : null}
        />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* PANEL 1: HISTORY OF RESERVATIONS MATRIX */}
        <div className="bg-surface rounded-xl p-5 border dark:border-textSecondary space-y-4">
        <h2 className="text-lead font-bold text-secondary border-b pb-2 dark:border-slate-800 flex items-center gap-1.5">
            <Reservation/>
            تاريخ حجوزات الطاولات 
        </h2>
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto 
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-surface
            [&::-webkit-scrollbar-thumb]:bg-secondary
            [&::-webkit-scrollbar-thumb]:rounded-full">
            {profile.reservations.length === 0 ? (
            <p className="text-xs text-textSecondary italic text-center p-4">لا توجد حجوزات مسجلة لهذا الحساب.</p>
            ) : (
            profile.reservations.map(res => (
                <div key={res.id} className="p-3 bg-grayBG dark:bg-bg/40 border dark:border-slate-800 rounded-lg flex justify-between text-xs sm:text-sm">
                <p className="text-textSecondary font-semibold">
                    طاولة: <span className="text-textPrimary font-bold">{res.table}</span> | مدة: <span className="text-textPrimary font-bold">{res.duration} د</span>
                </p>
                <p className="font-bold text-textPrimary">
                    {new Date(res.date).toLocaleDateString()}
                </p>
                </div>
            ))
            )}
        </div>
        </div>

        {/* PANEL 2: FINANCIAL LOGS RECEIPTS LEDGER */}
        <div className="bg-surface rounded-xl p-5 border dark:border-textSecondary space-y-4">
        <h2 className="text-lead font-bold text-secondary border-b pb-2 dark:border-slate-800 flex items-center gap-1.5">
            <Bills/>
            سجل الفواتير والحسابات المذكورة 
        </h2>
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-surface
            [&::-webkit-scrollbar-thumb]:bg-secondary
            [&::-webkit-scrollbar-thumb]:rounded-full
        ">
            {profile.invoices.length === 0 ? (
            <p className="text-xs text-textSecondary italic text-center p-4">لا توجد فواتير مرتبطة بهذا الحساب.</p>
            ) : (
            profile.invoices.map(inv => (
                <div key={inv.id} className="p-3 bg-grayBG dark:bg-bg/40 border dark:border-slate-800 rounded-lg flex justify-between items-center text-xs">
                <div className="text-right">
                    <p className="font-bold text-meta text-textPrimary">{inv.amount.toLocaleString()} ل.س</p>
                    <p className="text-meta text-textSecondary font-light mt-1">
                    {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                    inv.status === "PAID" ? "bg-green-50 text-accent" : "bg-red-50 text-red-500"
                }`}>
                    {inv.status === "PAID" ? "مدفوعة" : "غير مدفوعة"}
                </span>
                </div>
            ))
            )}
        </div>
        </div>

    </div>

    </div>
);
}
