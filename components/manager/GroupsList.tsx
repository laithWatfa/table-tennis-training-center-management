import { Person } from "@/icons";
// Types
interface Invoice {
  id: string;
  amount: number;
  status: "PAID" | "UNPAID";
  createdAt: string;
  paidAt?: string | null; // optional original payment timestamp if you still use it
  confirmedAt?: string | null; // when status changed from UNPAID -> PAID

  user: { name: string };
  // invoice is either linked to a reservation OR a subscription (one of them will be present)
  reservation?: { type?: string; durationMinutes?: number } | null;
  subscription?: { name?: string; duration?: string } | null;
}

interface Props {
  invoices: Invoice[];
}

export default function InvoiceList({ invoices }: Props) {
  const renderInvoiceType = (inv: Invoice) => {
    if (inv.reservation) {
      // show reservation details (e.g. duration)
      const minutes = inv.reservation.durationMinutes ?? null;
      return minutes ? `حجز ${minutes} دقيقة` : inv.reservation.type ?? "حجز";
    }
    if (inv.subscription) {
      // show subscription name or duration
      return inv.subscription.name ?? inv.subscription.duration ?? "اشتراك";
    }
    return "—";
  };

  return (
    <div className="w-full rounded-xl overflow-hidden lg:shadow-basic mt-4">
      {/* Table header for large screens */}
      <div className="hidden lg:grid grid-cols-5 bg-red-600 text-white p-3 rounded-t-xl font-semibold text-sm">
        <div className="text-right">اللاعب</div>
        <div className="text-right">نوع الفاتورة</div>
        <div className="text-right">تاريخ الإصدار</div>
        <div className="text-right">المبلغ</div>
        <div className="text-right">الحالة</div>
      </div>

      {/* Table rows for large screens */}
      <div className="hidden lg:flex flex-col border border-gray-bg overflow-hidden rounded-b-xl divide-y">
        {invoices.map((inv) => (
          <div key={inv.id} className="grid grid-cols-5 p-3 text-sm items-center bg-surface">
            <div className="text-right">{inv.user.name}</div>
            <div className="text-right">{renderInvoiceType(inv)}</div>
            <div className="text-right">{inv.createdAt}</div>
            <div className="text-right">{inv.amount.toLocaleString()} ل.س</div>
            <div 
              className={`font-semibold text-right ${inv.status == "PAID" ? "text-accent pointer-events-none" : "text-amber cursor-pointer"}`}
              onClick={()=> console.log("change status")}
            > 
              {inv.status === "PAID" ? "مدفوعة" : "غير مدفوعة"}
            </div>
          </div>
        ))}
      </div>

      {/* Cards for small screens */}
      <div className="lg:hidden space-y-3 md:grid md:space-y-0 md:grid-cols-2 gap-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="border rounded-xl py-2 px-4 shadow-sm flex flex-col gap-3 bg-surface"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex gap-2 items-center font-bold text-right text-lead">
                  <Person className="text-primary"/>
                  {inv.user.name}
                </div>

                <div className="flex flex-wrap items-start gap-[2px] text-textSecondary">
                  <span >تاريخ الإصدار:</span>
                  <span>{inv.createdAt}</span>
                </div>

                <div className="flex items-start gap-1 text-textSecondary">
                  <span >تاريخ الدفع:</span>
                  <span>{inv.paidAt ?? "لم تدفع"}</span>
                </div>

              </div>

              <div className="flex flex-col gap-1 font-bold text-body items-center w-1/2 border-r-2 border-textSecondary mr-1">
                <div className="text-textSecondary text-right">{renderInvoiceType(inv)}</div>
                <span className="">{inv.amount.toLocaleString()} ل.س</span>
                <span
                onClick={() => console.log("change status")}
                className={
                  `flex items-center justify-center px-3 pb-1 rounded-md text-surface   ${inv.status == "PAID" ? " bg-accent pointer-events-none" : "bg-amber cursor-pointer"}`
                }
              >
                  {inv.status === "PAID" ? "مدفوعة" : "غير مدفوعة"}
                </span>
              </div>
              
              
            </div>
            <div className="text-sm text-right space-y-2">
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}