"use client"
import React , {useState} from 'react'
import { SortBy } from '@/components/player'
// import { mockInvoices } from '@/mockData' 
import { InvoiceWithReservationAndUser } from '@/types'
import useSWR from "swr";
import RadioButtons from '@/components/manager/RadioButtons'
import DynamicSkeleton from '@/components/ui/DynamicSkeleton'

const filters = [
    { id: "", label: "كل الفواتير" },
    { id: "PAID", label: "مدفوعة" },
    { id: "UNPAID", label: "غير مدفوعة" },
];


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDate = (date: Date | null): string => {
  if(date) return new Intl.DateTimeFormat("en-GB").format(new Date(date));
  return "لم تدفع"
};

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
const InvoicesPage = () => {

    const [filter,setFilter] = useState("");
    const [sortBy,setSortBy] = useState("");

      const { data , error, isLoading } = useSWR(`/api/player/invoices?status=${filter}&orderBy=${sortBy}`, fetcher);

      const invoices = data?.invoices || [];
      const debtMetrics = data?.debtMetrics;
  // if (isLoading) return <DynamicSkeleton type="grid" cardsCount={16}/>;
  if (error) return <p>حدث خطأ أثناء تحميل البيانات</p>;

  return (
    <main>
        <div className='flex flex-col gap-2 md:flex-row md:items-start  justify-between'>
            <span className='flex justify-between gap-2'>
                <RadioButtons options={filters} value={filter} onChange={setFilter} classes='md:order-2 shadow-basic mx-auto sm:mx-0 ' />
                <SortBy sortedBy={sortBy} onChange={setSortBy}/>
            </span>
            <div
            className='text-primary text-h3 font-bold'
              >الذمة المالية : {debtMetrics?.currentDebt || 0} ل.س
            </div>
        </div>
        {
          isLoading ? 
            <DynamicSkeleton type="invoices" cardsCount={8}/> 
            :
                    <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>

            {Array.isArray(invoices) && invoices?.map( (inv : InvoiceWithReservationAndUser) => {
                return <div 
                className='flex flex-col relative gap-2 p-2
                bg-surface  shadow-basic rounded-lg'
                key={inv.id}>
                  <div className='text-lead font-bold'>{renderInvoiceType(inv)}</div>
                  <div>
                    <div className="flex flex-wrap items-start gap-[2px] text-textSecondary">
                    <span >تاريخ الإصدار:</span>
                    <span>{formatDate(inv.createdAt)}</span>
                  </div>

                  <div className="flex items-start gap-1 text-textSecondary">
                    <span >تاريخ الدفع:</span>
                    <span>{formatDate(inv.paidAt)}</span>
                  </div>
                  </div>

                <div className="flex flex-col gap-1 font-bold text-body items-center   mr-1">
                  <span  className={
                    `flex items-center justify-center
                    absolute bottom-4 left-0
                    px-3 pb-1 rounded-r-md text-surface   
                    ${inv.status == "PAID" ? " bg-accent" : "bg-amber"}`
                  }>{inv.amount.toLocaleString()} ل.س</span>
                </div>
                </div>
              })}
        </section>
        }

                
    </main>
  )
}

export default InvoicesPage