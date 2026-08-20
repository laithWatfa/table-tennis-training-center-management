"use client"
import { Check } from '@/icons'
import React, { useState } from 'react'
import { CgSandClock } from 'react-icons/cg'
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';

interface Props {
  subscription: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    invoiceStatus: 'PAID' | 'UNPAID' | string; // Adjust statuses if you add more to InvoiceStatus enum
    amount: number;
  };
}

// Quick helper to safely render a neat short Arabic localized date format
function formatDateArabic(date: Date): string {
  return new Date(date).toLocaleDateString('ar-SY', {
    day: 'numeric',
    month: 'numeric',
  });
}


const SubscriptionCard = ({ subscription }: Props) => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const isActive = subscription.invoiceStatus === 'PAID';
  
  const startStr = formatDateArabic(subscription.startDate);
  const endStr = subscription.endDate ? formatDateArabic(subscription.endDate) : 'مفتوح';

  const isEligibleForRenewal = () => {
  if (!isActive) return false;
  if (!subscription.endDate) return false; // If the subscription is infinite/open, hide renew button

  const now = new Date();
  const expirationDate = new Date(subscription.endDate);
  
  // Calculate the difference in milliseconds and convert directly to days
  const timeDifference = expirationDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Eligible only if the subscription expires within the next 7 days, 
  // but protect it if the plan has already fully expired (daysRemaining >= 0)
  return daysRemaining <= 7 && daysRemaining >= 0;
};

const showRenewButton = isEligibleForRenewal();

  // 1. HANDLES CANCELLATION PROTOCOLS Safely
  const handleCancel = async () => {
    const promptMessage = isActive 
      ? "هل تريد إلغاء التجديد التلقائي؟ ستظل عضويتك نشطة حتى نهاية المدة المدفوعة." 
      : "هل تريد حذف هذا الطلب وإلغاء الاشتراك المعلق؟";
      
    if (!window.confirm(promptMessage)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/player/subscriptions/${subscription.id}/cancel`, {
        method: "POST"
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "فشل إلغاء الاشتراك");

      alert(data.message || "تم إلغاء الاشتراك بنجاح");
      mutate("/api/player/invoices");
      router.refresh()
      // Revalidate parent page layout caches
    } catch (err: unknown) {
      if(err instanceof Error) alert(err.message);
      else alert(err)
    } finally {
      setLoading(false);
    }
  };

  // 2. HANDLES RENEWALS PRE-CALCULATIONS Safely
  const handleRenew = async () => {
    if (!window.confirm(`هل ترغب في تجديد اشتراك "${subscription.name}" لمدة شهر إضافي؟`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/player/subscriptions/${subscription.id}/renew`, {
        method: "POST"
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "فشل طلب التجديد");

      alert("تم تقديم طلب التجديد بنجاح! يرجى مراجعة المشرف لتسديد الفاتورة الجديدة.");
      mutate("/api/player/invoices");
      router.refresh()
    } catch (err: unknown) {
      if(err instanceof Error) alert(err.message);
      else alert(err)
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='bg-surface overflow-hidden rounded relative shadow-basic p-2 dark:border dark:border-textSecondary'>
        
        {/* Dynamic Card Headings */}
        <h3 className='text-lead  text-textPrimary font-bold'>{subscription.name}</h3>
        <p className='text-lead font-bold text-textSecondary'>
          {subscription.amount.toLocaleString()} <span className='text-small'>ل.س</span>
          
        </p>
        <p className='text-small  font-medium mt-1 text-textSecondary'>
          {`من: ${startStr} إلى: ${endStr}`}
        </p>

        {/* Action Buttons Footer Container */}
        <div className='flex flex-row-reverse justify-between p-2 border-t-2 mt-4 border-textSecondary'>
          {showRenewButton ? (
            <button 
              onClick={handleRenew}
              disabled={loading}
              className='filled-button !rounded-md !px-8 !pt-1 !bg-secondary hover:!bg-blue-500'>
              تجديد
            </button>
          ) : (
            <></>
          )}
          
          <button 
            onClick={handleCancel}
            disabled={loading}
            className='outlined-button !rounded-md !px-8 !text-primary hover:!text-surface !border-primary disabled:opacity-40'>
            {loading ? "جار الإلغاء" : isActive ? "إلغاء التجديد" : "حذف الطلب"}
          </button>
        </div>

        {/* Absolute Ribbon Badge Flag */}
        {isActive ? (
          <div className='absolute flex items-center bg-accent text-whiteT text-small md:text-lead left-0 top-0 pr-8 pl-4 md:pl-6 py-2 gap-1 font-bold'>
            <span className='w-9 lg:w-10 h-full absolute bg-surface -right-4  -skew-x-[20deg]'></span>
            <Check className='' />
            نشطة
          </div>
        ) : (
          <div className='absolute flex items-center bg-amber text-whiteT text-small md:text-lead left-0 top-0 pr-8 pl-4 md:pl-6 py-2 gap-1 font-bold'>
            <span className='w-9 h-full absolute bg-surface -right-4 -skew-x-[20deg]'></span>
            <CgSandClock className='bg-whiteT text-amber rounded-full p-1 w-6 h-6' />
            بانتظار الدفع
          </div>
        )}
          
    </div>
  )
}

export default SubscriptionCard;
