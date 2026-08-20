"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CgSpinner, CgLock, CgMail, CgCalendar } from "react-icons/cg";
import { Edit } from "@/icons";

interface EditPlayerCredentialsProps {
playerId: string;
initialEmail: string;
initialDob: string | null; // Pass as YYYY-MM-DD string from parent
}

export default function EditPlayerCredentials({
playerId,
initialEmail,
initialDob,
}: EditPlayerCredentialsProps) {
const router = useRouter();

// Controlled Input Parameters States
const [email, setEmail] = useState(initialEmail);
const [password, setPassword] = useState(""); // Leave blank by default for safety overrides
const [dateOfBirth, setDateOfBirth] = useState(initialDob || "");

// Operational Process trackers
const [isSaving, setIsSaving] = useState(false);
const [panelError, setPanelError] = useState<string | null>(null);
const [panelSuccess, setPanelSuccess] = useState<string | null>(null);

const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setPanelError(null);
    setPanelSuccess(null);

    try {
    const response = await fetch(`/api/manager/players/${playerId}/update-credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, dateOfBirth }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "فشل تعديل البيانات");

    setPanelSuccess("تم تثبيت وحفظ التعديلات الجديدة بنجاح!");
    setPassword(""); // Wipe password variable display layer for security safety after submission
    router.refresh(); // Sync server parent components data maps instantly
    } catch (err: unknown) {
    if(err instanceof Error) setPanelError(err.message || "حدث خطأ غير متوقع");
    } finally {
    setIsSaving(false);
    }
};

return (
    <form onSubmit={handleUpdateSubmit} className="bg-surface rounded-xl p-5 border dark:border-textSecondary space-y-4 text-right">
    <div>
        <h2 className="text-lead font-bold text-secondary border-b pb-2 dark:border-slate-800 flex items-center gap-1.5 ">
        <Edit/>
        تعديل بيانات الحساب السرية
        </h2>
        <p className="text-[11px] text-textSecondary mt-1 leading-normal">
        تعديل البريد الإلكتروني، أو تاريخ الميلاد، أو تعيين كلمة مرور جديدة قسرية للاعب.
        </p>
    </div>

    {panelError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-500 font-bold p-2 rounded text-center text-xs">
        ⚠️ {panelError}
        </div>
    )}

    {panelSuccess && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-accent/20 text-accent font-bold p-2 rounded text-center text-xs">
        ✅ {panelSuccess}
        </div>
    )}

    {/* Field 1: Email Handle input tracking */}
    <div className="space-y-1">
        <label className="text-xs font-bold text-textSecondary block">البريد الإلكتروني (اسم المستخدم)</label>
        <div className="relative">
        <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-10 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition text-xs sm:text-sm font-sans"
        />
        <CgMail className="absolute left-3 top-3 text-textSecondary" />
        </div>
    </div>

    {/* Field 2: Password override input tracking */}
    <div className="space-y-1">
        <label className="text-xs font-bold text-textSecondary block">تعيين كلمة مرور جديدة قسرية</label>
        <div className="relative">
        <input
            type="text"
            placeholder="اتركه فارغاً لإبقاء كلمة المرور القديمة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-10 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition text-xs sm:text-sm font-sans"
        />
        <CgLock className="absolute left-3 top-3 text-textSecondary" />
        </div>
    </div>

    {/* Field 3: Date of Birth Calendar input tracking */}
    <div className="space-y-1">
        <label className="text-xs font-bold text-textSecondary block">تاريخ الميلاد</label>
        <div className="relative">
        <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-10 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition text-xs sm:text-sm font-sans"
        />
        <CgCalendar className="absolute left-3 top-3 text-textSecondary pointer-events-none" />
        </div>
    </div>

    {/* Submit Button wrapper */}
    <div className="pt-2">
        <button
        type="submit"
        disabled={isSaving}
        className="w-full filled-button !py-2 !bg-secondary hover:brightness-95 font-bold text-xs text-white rounded-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
        {isSaving && <CgSpinner className="animate-spin text-lead" />}
        تثبيت وحفظ البيانات الجديدة
        </button>
    </div>
    </form>
);
}
