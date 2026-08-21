"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Cancel } from "@/icons";
import { CgHashtag, CgMail, CgSpinner, CgTime } from "react-icons/cg";
import { VenueSetting } from "@/app/generated/prisma/client";
import AgeGroupsSettings from "@/components/manager/AgeGroupSettings";


export default function ManagerSettingsPage() {

// Ensure these state hooks are initialized near the top of your main Page Component function block:
const [adminList, setAdminList] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
const [isSuperAdmin, setIsSuperAdmin] = useState(false);

// Update your primary initialization useEffect hook block to fetch this list simultaneously on page render:
useEffect(() => {
async function loadInitialData() {
    try {
    const [settingsRes, adminRes] = await Promise.all([
        fetch("/api/manager/settings"),
        fetch("/api/manager/admins")
    ]);
    
    if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
    }
    
    if (adminRes.ok) {
        const aData = await adminRes.json();
        setAdminList(aData.admins);
        setIsSuperAdmin(aData.isSuperAdmin); // 👈 Stores if the current manager is the unique owner
    }
    } catch (err) {
    console.error("Failed loading configuration components:", err);
    } finally {
    setIsLoading(false);
    }
}
loadInitialData();
}, []);

const router = useRouter();

// Form Loading & State triggers
const [settings, setSettings] = useState<VenueSetting | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [formError, setFormError] = useState<string | null>(null);
const [formSuccess, setFormSuccess] = useState<string | null>(null);

// Admin Management state trackers
const [adminEmail, setAdminEmail] = useState("");
const [isAdminProcessing, setIsAdminProcessing] = useState(false);
const [adminMessage, setAdminMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

// 1. Initial Load: Hydrate database variables from our central settings API
useEffect(() => {
    async function fetchSettings() {
    try {
        const res = await fetch("/api/manager/settings");
        if (!res.ok) throw new Error("تعذر تحميل الإعدادات من الخادم");
        const data = await res.json();
        setSettings(data);
    } catch (err: unknown) {
      if(err instanceof Error)  setFormError(err.message || "حدث خطأ غير متوقع");
      else setFormError("حدث خطأ غير متوقع")
    } finally {
        setIsLoading(false);
    }
    }
    fetchSettings();
}, []);

// 2. Submit Action: Dispatch updated config records to database via PUT action
const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setFormError(null);
    setFormSuccess(null);

    try {
    const res = await fetch("/api/manager/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل تعديل الإعدادات");

    setFormSuccess("تم تحديث أسعار التشغيل وإعدادات الصالة بنجاح!");
    router.refresh();
    } catch (err: any) {
    setFormError(err.message || "حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
    setIsSaving(false);
    }
};

// 3. Promote/Demote Action: Handle administrative system credential changes
const handleAdminAction = async (action: "PROMOTE" | "DEMOTE") => {
    if (!adminEmail.trim()) {
    setAdminMessage({ text: "يرجى إدخال بريد إلكتروني صالح", type: "error" });
    return;
    }

    const confirmPrompt = action === "PROMOTE" 
    ? `هل أنت متأكد من منح صلاحيات المشرف الكاملة للحساب: ${adminEmail}؟`
    : `هل أنت متأكد من سحب صلاحيات الإشراف عن الحساب: ${adminEmail}؟`;

    if (!window.confirm(confirmPrompt)) return;

    setIsAdminProcessing(true);
    setAdminMessage(null);

    try {
    const res = await fetch("/api/manager/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), action }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل إتمام العملية");

    setAdminMessage({ text: data.message || "تم تحديث الصلاحيات بنجاح", type: "success" });
    setAdminEmail("");
    router.refresh();
    } catch (err: any) {
    setAdminMessage({ text: err.message || "فشل تعديل الرتبة الإدارية", type: "error" });
    } finally {
    setIsAdminProcessing(false);
    }
};

if (isLoading) {
    return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-textSecondary gap-2">
        <CgSpinner className="animate-spin text-h1 text-secondary" />
        <p className="font-semibold text-lead">جاري تحميل بيانات الصالة والأسعار...</p>
    </div>
    );
}

return (
    <div className="space-y-8 w-full max-w-5xl mx-auto px-1 text-right">
    
    {/* Dynamic Header */}
    <div>
        <h1 className="text-h2 font-bold text-textPrimary">إعدادات النظام والصالة</h1>
        <p className="text-textSecondary text-sm md:text-base mt-1">
        قم بتعديل تسعيرة الحجوزات، كاش المضرب، وتعيين صلاحيات المشرفين الجدد.
        </p>
    </div>

    {/* Main Form Fields Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT & CENTER COLUMNS: Operational Matrix Form */}
        <form onSubmit={handleSettingsSubmit} className="lg:col-span-2 bg-surface rounded-xl p-6 shadow-basic border dark:border-textSecondary space-y-6">
        <h2 className="text-lead md:text-h3 font-bold text-secondary border-b pb-2 dark:border-slate-800">
            📊 أسعار الحجوزات والمعايير المالية
        </h2>

        {formError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-500 font-bold p-3 rounded text-center text-sm">
            ⚠️ {formError}
            </div>
        )}

        {formSuccess && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-accent/20 text-accent font-bold p-3 rounded text-center text-sm flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> {formSuccess}
            </div>
        )}

        {settings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Field 1: Table rate */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">سعر حجز الطاولة (للساعة الواحدة)</label>
                <div className="relative">
                <input
                    type="number"
                    required
                    value={settings.tableRatePerHour}
                    onChange={(e) => setSettings({ ...settings, tableRatePerHour: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">ل.س</span>
                </div>
            </div>

            {/* Field 2: Coach Rate */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">تكلفة إشراف المدرب الكابتن (للساعة)</label>
                <div className="relative">
                <input
                    type="number"
                    required
                    value={settings.coachRatePerHour}
                    onChange={(e) => setSettings({ ...settings, coachRatePerHour: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">ل.س</span>
                </div>
            </div>

            {/* Field 3: Paddle Flat Fee */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">أجور استعارة المضارب الفردية (مبلغ ثابت)</label>
                <div className="relative">
                <input
                    type="number"
                    required
                    value={settings.paddlesFlatFee}
                    onChange={(e) => setSettings({ ...settings, paddlesFlatFee: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">ل.س</span>
                </div>
            </div>

            {/* Field 4: Debt Maximum Cap */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">سقف الذمم المالية والديون المعلقة للاعب</label>
                <div className="relative">
                <input
                    type="number"
                    required
                    value={settings.maxDebtLimit}
                    onChange={(e) => setSettings({ ...settings, maxDebtLimit: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">ل.س</span>
                </div>
            </div>

            {/* Field 5: Opening Operating Hour */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">ساعة افتتاح النادي (توقيت 24 ساعة)</label>
                <div className="relative">
                <input
                    type="number"
                    min={0}
                    max={23}
                    required
                    value={settings.openHour}
                    onChange={(e) => setSettings({ ...settings, openHour: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <CgTime className="absolute left-3 top-3 text-textSecondary" />
                </div>
            </div>

            {/* Field 6: Closing Operating Hour */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">ساعة إغلاق النادي الرسمي (توقيت 24 ساعة)</label>
                <div className="relative">
                <input
                    type="number"
                    min={0}
                    max={23}
                    required
                    value={settings.closeHour}
                    onChange={(e) => setSettings({ ...settings, closeHour: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <CgTime className="absolute left-3 top-3 text-textSecondary" />
                </div>
            </div>

            {/* Field 7: Dynamic Total Venue Tables Count */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">عدد طاولات اللعب الإجمالي المتوفرة في الصالة</label>
                <div className="relative">
                <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={settings.totalTables}
                    onChange={(e) => setSettings({ ...settings, totalTables: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">طاولات</span>
                </div>
            </div>

            {/* Field 8: Reservation Cancellation Lockout Window */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-textSecondary block">المهلة الزمنية الدنيا المتاحة لإلغاء الحجز من اللاعب</label>
                <div className="relative">
                <input
                    type="number"
                    min={0}
                    max={72}
                    required
                    value={settings.cancellationWindow}
                    onChange={(e) => setSettings({ ...settings, cancellationWindow: Number(e.target.value) })}
                    className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-12 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition"
                />
                <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-bold pointer-events-none">ساعة</span>
                </div>
            </div>

            </div>
        )}

        {/* Action Dispatcher Row */}
        <div className="flex justify-start pt-2 border-t dark:border-slate-800">
            <button
            type="submit"
            disabled={isSaving}
            className="filled-button !px-8 !py-2.5 !bg-secondary hover:!bg-blue-600 font-bold text-sm text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
            {isSaving && <CgSpinner className="animate-spin" />}
            حفظ وتثبيت التعديلات الحالية
            </button>
        </div>
        </form>

        {/* RIGHT COLUMN: Admin Promotion / Elevation control sandbox panel */}
        {/* RIGHT COLUMN: Admin Promotion & Staff Control System Panel */}
        <div className="bg-surface rounded-xl p-6 shadow-basic border dark:border-textSecondary space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-lead md:text-h3 font-bold text-secondary border-b pb-2 dark:border-slate-800">
              👑 إدارة طاقم العمل والمشرفين
            </h2>
            <p className="text-xs text-textSecondary leading-relaxed">
              عرض المشرفين الحاليين في النظام. {isSuperAdmin ? "يمكنك إضافة أو إزالة المشرفين." : "حساب المالك فقط يمتلك صلاحية التعديل."}
            </p>
          </div>

          {/* 1. ADMIN LIST ROSTER LOOP TABLE CONTAINER */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textSecondary block">المشرفون الحاليون في النظام:</label>
            <div className="border dark:border-slate-800 rounded-lg overflow-hidden divide-y dark:divide-slate-800 max-h-[220px] overflow-y-auto bg-grayBG dark:bg-bg/40">
              {adminList.length === 0 ? (
                <p className="text-xs p-3 text-center text-textSecondary italic">جاري تحميل الطاقم...</p>
              ) : (
                adminList.map((adm) => (
                  <div key={adm.id} className="p-2.5 flex justify-between items-center text-xs">
                    {isSuperAdmin && adm.email !== "owner@yourdomain.com" ? (
                      <button
                        type="button"
                        disabled={isAdminProcessing}
                        onClick={async () => {
                          setAdminEmail(adm.email);
                          // Trigger removal pipeline directly via state binding
                          if (window.confirm(`هل أنت متأكد من سحب صلاحيات الإشراف عن ${adm.fullName}؟`)) {
                            setIsAdminProcessing(true);
                            try {
                              const res = await fetch("/api/manager/admins", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: adm.email, action: "DEMOTE" }),
                              });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error);
                              setAdminMessage({ text: data.message, type: "success" });
                              setAdminEmail("");
                              // Refresh current page states natively
                              const refreshRes = await fetch("/api/manager/admins");
                              const refreshData = await refreshRes.json();
                              setAdminList(refreshData.admins);
                            } catch (err: any) {
                              setAdminMessage({ text: err.message, type: "error" });
                            } finally {
                              setIsAdminProcessing(false);
                            }
                          }
                        }}
                        className="text-red-500 font-bold hover:underline bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded"
                      >
                        إزالة الصلاحية
                      </button>
                    ) : (
                      <span className="text-[10px] text-textSecondary font-bold bg-surface px-2 py-1 rounded border dark:border-slate-800">
                        {adm.email === "owner@yourdomain.com" ? "مالك النظام" : "مشرف"}
                      </span>
                    )}
                    <div className="text-right">
                      <p className="font-bold text-textPrimary">{adm.fullName}</p>
                      <p className="text-[11px] text-textSecondary font-medium">{adm.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. DYNAMIC INPUT INTERACTION BLOCK FOR SUPER ADMIN */}
          {adminMessage && (
            <div className={`p-2.5 rounded text-center text-xs font-semibold border ${
              adminMessage.type === "success" 
                ? "bg-green-50 dark:bg-green-950/20 text-accent border-accent/10" 
                : "bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200"
            }`}>
              {adminMessage.text}
            </div>
          )}

          <div className="space-y-1 pt-2 border-t dark:border-slate-800">
            <label className="text-xs font-bold text-textSecondary block">إضافة مشرف جديد بالنظام</label>
            <div className="relative">
              <input
                type="email"
                placeholder={isSuperAdmin ? "example@domain.com" : "مغلق لعدم الاختصاص"}
                disabled={!isSuperAdmin || isAdminProcessing}
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-grayBG dark:bg-bg border border-textSecondary/20 rounded-lg py-2 pl-10 pr-3 font-semibold text-textPrimary text-left focus:outline-none focus:border-secondary transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <CgMail className="absolute left-3 top-3 text-textSecondary" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!isSuperAdmin || isAdminProcessing}
              onClick={() => handleAdminAction("PROMOTE")}
              className="w-full filled-button !py-2 !bg-accent hover:opacity-95 font-bold text-xs text-white rounded-md flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAdminProcessing ? "جاري ترقية الحساب..." : "✨ ترقية الحساب إلى مشرف"}
            </button>
          </div>
        </div>

      </div>

        <section className="w-full pt-4">
        <AgeGroupsSettings />
      </section>
    </div>

);
}
