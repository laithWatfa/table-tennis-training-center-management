"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@/icons";
import { FaTrashAlt as Cancel } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

interface AgeGroup {
id: string;
name: string;
minAge: number;
maxAge: number;
}

export default function AgeGroupsSettings() {
const router = useRouter();

const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isProcessing, setIsProcessing] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

// New form fields state
const [newName, setNewName] = useState("");
const [newMinAge, setNewMinAge] = useState<number | "">("");
const [newMaxAge, setNewMaxAge] = useState<number | "">("");

// Fetch current database categories on render load
const loadAgeGroups = async () => {
    try {
    const res = await fetch("/api/manager/age-groups");
    if (res.ok) {
        const data = await res.json();
        setAgeGroups(data);
    }
    } catch (err) {
    console.error("Failed loading age groups:", err);
    } finally {
    setIsLoading(false);
    }
};

useEffect(() => {
    loadAgeGroups();
}, []);

// Dispatch New Item Creation Pipeline
const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newMinAge === "" || newMaxAge === "") return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
    const res = await fetch("/api/manager/age-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        name: newName.trim(),
        minAge: Number(newMinAge),
        maxAge: Number(newMaxAge),
        }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل إتمام العملية");

    // Reset local fields layout state parameters
    setNewName("");
    setNewMinAge("");
    setNewMaxAge("");
    
    await loadAgeGroups();
    router.refresh();
    } catch (err: unknown) {
    if(err instanceof Error) setErrorMessage(err.message || "حدث خطأ في الشبكة");
    else setErrorMessage("حدث خطأ في الشبكة");
    }  finally {
    setIsProcessing(false);
    }
};

// Dispatch Purge Deletion Pipeline
const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الفئة العمرية "${name}"؟`)) return;

    setIsProcessing(true);
    try {
    const res = await fetch(`/api/manager/age-groups/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل حذف العنصر");
    }
    await loadAgeGroups();
    router.refresh();
    } catch (err: unknown) {
    if(err instanceof Error) alert(err.message);
    else alert(err);
    }  finally {
    setIsProcessing(false);
    }
};

if (isLoading) {
    return (
    <div className="text-center p-4 text-xs text-textSecondary flex items-center justify-center gap-2">
        <CgSpinner className="animate-spin text-secondary text-lead" />
        جاري تحميل الفئات العمرية...
    </div>
    );
}

return (
    <div className="bg-surface rounded-xl p-6 shadow-basic border dark:border-textSecondary grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
        {/* RIGHT COLUMN PANEL: ADD NEW BRACKETS FORM */}
    <form onSubmit={handleCreateGroup} className="space-y-4 border-r pr-0 md:pr-6 border-textSecondary/10 dark:border-slate-800">
        <div>
        <h2 className="flex items-end gap-2 text-lead md:text-h3 font-bold text-secondary border-b pb-2 dark:border-slate-800">
             <Plus/> إضافة فئة عمرية جديدة
        </h2>
        <p className="text-xs text-textSecondary leading-relaxed mt-1">
            قم بتسمية شريحة عمرية جديدة مخصصة للاعبين لتسجيلها في النظام.
        </p>
        </div>

        {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-500 font-bold p-2 rounded text-center text-xs">
            ⚠️ {errorMessage}
        </div>
        )}

        {/* Input 1: Category Name */}
        <div className="space-y-1">
        <label className="text-xs font-bold text-textSecondary block">اسم الفئة العمرية</label>
        <input
            type="text"
            required
            placeholder="مثال: أشبال، ناشئين، كبار"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 px-3 font-semibold text-textPrimary focus:outline-none focus:border-secondary transition text-sm text-right"
        />
        </div>

        {/* Min & Max inputs inline grid split */}
        <div className="grid grid-cols-2 gap-3">
        {/* Input 2: Min Age */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-textSecondary block">الحد الأدنى للسن</label>
            <div className="relative">
            <input
                type="number"
                min={1}
                max={120}
                required
                placeholder="7"
                value={newMinAge}
                onChange={(e) => setNewMinAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition text-sm"
            />
            <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">سنة</span>
            </div>
        </div>

        {/* Input 3: Max Age */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-textSecondary block">الحد الأقصى للسن</label>
            <div className="relative">
            <input
                type="number"
                min={1}
                max={120}
                required
                placeholder="14"
                value={newMaxAge}
                onChange={(e) => setNewMaxAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition text-sm"
            />
            <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">سنة</span>
            </div>
        </div>
        </div>

        {/* Submit Dispatcher Button */}
        <div className="pt-2">
        <button
            type="submit"
            disabled={isProcessing}
            className="w-full filled-button !py-2.5 !bg-secondary hover:!bg-blue-600 font-bold text-xs text-white rounded-md flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
            {isProcessing ? "جاري الحفظ..." : "💾 إضافة وحفظ الفئة الجديدة"}
        </button>
        </div>
    </form>
    {/* LEFT COLUMN PANEL: VIEW EXISTING LISTS */}
    <div className="space-y-4">
        <div>
        <h2 className="text-lead md:text-h3 font-bold text-secondary border-b pb-2 dark:border-slate-800">
            🏃‍♂️ الفئات العمرية الحالية
        </h2>
        <p className="text-xs text-textSecondary leading-relaxed mt-1">
            الفئات العمرية المتاحة لتصنيف مجموعات المشتركين وتحديد خطط التمارين.
        </p>
        </div>

        <div className="border dark:border-slate-800 rounded-lg overflow-hidden divide-y dark:divide-slate-800 bg-grayBG dark:bg-bg/40 max-h-[260px] overflow-y-auto">
        {ageGroups.length === 0 ? (
            <p className="text-xs p-4 text-center text-textSecondary italic">لم يتم إعداد فئات عمرية بعد.</p>
        ) : (
            ageGroups.map((group) => (
            <div key={group.id} className="p-3 flex justify-between items-center text-xs sm:text-sm">
                <div className="text-right">
                    <p className="font-bold text-textPrimary">{group.name}</p>
                    <p className="text-[11px] text-textSecondary font-semibold mt-0.5">
                        {`العمر المسموح: من ${group.minAge} إلى ${group.maxAge} سنة`}
                    </p>
                </div>
                <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDeleteGroup(group.id, group.name)}
                className="text-red-500 font-bold hover:underline bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                <Cancel className="w-3 h-3" /> حذف الفئة
                </button>
            </div>
            ))
        )}
        </div>
    </div>



    </div>
);
}
