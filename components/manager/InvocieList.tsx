import { Person } from "@/icons";
import {InvoiceWithReservationAndUser } from "@/types";
import { useState } from "react";


const formatDate = (date: Date | null): string => {
  if(date) return new Intl.DateTimeFormat("en-GB").format(new Date(date));
  return "لم تدفع"
};

interface Props {
  invoices: InvoiceWithReservationAndUser[];
  onStatusUpdated?: () => void; 
}

export default function InvoiceList({ invoices, onStatusUpdated }: Props) {
  const [updatingInvoiceIds, setUpdatingInvoiceIds] = useState<Record<string, boolean>>({});
  const renderInvoiceType = (inv: InvoiceWithReservationAndUser) => {
    if (inv.reservation) {
      // show reservation details (e.g. duration)
      const minutes = inv.reservation.duration ?? null;
      return minutes ? `حجز ${minutes} دقيقة` :  "حجز";
    }
    if (inv.subscriptionId) {
      // show subscription name or duration
      return "اشتراك شهري";
    }
    return "—";
  };

  const handleMarkAsPaid = async (invoiceId: string, currentStatus: string) => {
    if (currentStatus === "PAID" || updatingInvoiceIds[invoiceId]) return;

    const confirmPayment = window.confirm("هل أنت متأكد من تغيير حالة هذه الفاتورة إلى مدفوعة؟");
    if (!confirmPayment) return;

    // Toggle local element loading state
    setUpdatingInvoiceIds((prev) => ({ ...prev, [invoiceId]: true }));

    try {
      const response = await fetch(`/api/manager/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ غير متوقع أثناء تحديث البيانات");
      }

      console.log("Invoice processed successfully:", result);

      // Tell SWR to refresh its cache data instantly
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: unknown) {
    if(error instanceof Error) alert(error.message || "فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    else alert("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      
    } finally {
      // Clear specific item loading state
      setUpdatingInvoiceIds((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden lg:shadow-basic mt-4">
      {/* Table header for large screens */}
      <div className="hidden lg:grid grid-cols-5 bg-primary text-white p-3 rounded-t-xl font-semibold text-sm">
        <div className="text-right">اللاعب</div>
        <div className="text-right">نوع الفاتورة</div>
        <div className="text-right">تاريخ الإصدار</div>
        <div className="text-right">المبلغ</div>
        <div className="text-right">الحالة</div>
      </div>

      {/* Table rows for large screens */}
      <div className="hidden lg:flex flex-col border border-gray-bg overflow-hidden rounded-b-xl divide-y">
        {invoices.map((inv) => {
          const isItemLoading = updatingInvoiceIds[inv.id];
          return (
            <div key={inv.id} className="grid grid-cols-5 p-3 text-sm items-center bg-surface">
              <div className="text-right font-medium text-textPrimary">{inv.user.fullName}</div>
              <div className="text-right text-textSecondary">{renderInvoiceType(inv)}</div>
              <div className="text-right text-textSecondary">{formatDate(inv.createdAt)}</div>
              <div className="text-right font-bold text-textPrimary">{inv.amount.toLocaleString()} ل.س</div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(inv.id, inv.status)}
                  disabled={inv.status === "PAID" || isItemLoading}
                  className={`font-semibold text-sm transition rounded px-2 py-0.5 ${
                    inv.status === "PAID"
                      ? "text-accent border border-transparent pointer-events-none"
                      : isItemLoading
                      ? "text-textSecondary opacity-50 cursor-not-allowed"
                      : "text-amber border border-amber/30 hover:bg-amber/5 active:bg-amber/10 cursor-pointer"
                  }`}
                >
                  {isItemLoading ? "جاري التحديث..." : inv.status === "PAID" ? "مدفوعة" : "غير مدفوعة"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards for small screens */}
      <div className="lg:hidden space-y-3 md:grid md:space-y-0 md:grid-cols-2 gap-4">
        {invoices.map((inv) => {
          const isItemLoading = updatingInvoiceIds[inv.id];
          return (
            <div
              key={inv.id}
              className="border rounded-xl py-2 px-4 shadow-sm flex flex-col gap-3 bg-surface border-gray-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-2 items-center font-bold text-right text-lead">
                    <Person className="text-primary" />
                    {inv.user.fullName}
                  </div>

                  <div className="flex flex-wrap items-start gap-[2px] text-xs text-textSecondary mt-1">
                    <span>تاريخ الإصدار:</span>
                    <span>{formatDate(inv.createdAt)}</span>
                  </div>

                  <div className="flex items-start gap-1 text-xs text-textSecondary">
                    <span>تاريخ الدفع:</span>
                    <span className={inv.status === "PAID" ? "text-accent font-medium" : ""}>
                      {formatDate(inv.paidAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 font-bold text-body items-center w-1/2 border-r-2 border-textSecondary mr-1">
                  <div className="text-textSecondary text-label   truncate w-full pl-2 text-center">
                    {renderInvoiceType(inv)}
                  </div>
                  <span className="text-textPrimary text-body">{inv.amount.toLocaleString()} ل.س</span>
                  
                  <button
                    type="button"
                    onClick={() => handleMarkAsPaid(inv.id, inv.status)}
                    disabled={inv.status === "PAID" || isItemLoading}
                    className={`flex items-center justify-center px-4 py-1 rounded-md text-xs font-bold text-surface w-[85%] transition shadow-sm ${
                      inv.status === "PAID"
                        ? "bg-accent pointer-events-none"
                        : isItemLoading
                        ? "bg-gray-400 opacity-50 cursor-not-allowed"
                        : "bg-amber hover:brightness-95 active:brightness-90 cursor-pointer"
                    }`}
                  >
                    {isItemLoading ? "جاري..." : inv.status === "PAID" ? "مدفوعة" : "غير مدفوعة"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
