"use client";

import { Check } from '@/icons';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


interface Props {
    plan: {
        id: string; 
        name: string;
        monthlyPrice: number; 
        classesPerWeek: number; 
        withCoach: boolean; 
        withPaddles: boolean; 
    }
}

// 👈 Calculates exactly 1 month ahead from the given date
function getOneMonthAhead(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    return result;
}

const PlanCard = ({ plan }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false); 
    
    // 👈 Get current date and target end date
    const today = new Date();
    const oneMonthAhead = getOneMonthAhead(today);

    const handleSubscribe = async () => {
        const confirmSubscribe = window.confirm(`هل أنت متأكد من رغبتك في الاشتراك في "${plan.name}"؟`);
        if (!confirmSubscribe) return;

        setLoading(true);
        try {
            const response = await fetch("/api/player/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan.id,
                    monthsDuration: 1, 
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || "فشل الاشتراك في الباقة");
            }
        
            alert(`${resData.message}`);
            router.refresh();
            
        } catch (error: unknown) {
            if(error instanceof Error) alert(error.message || "حدث خطأ غير متوقع");
            else alert(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-surface rounded-lg dark:border dark:border-textSecondary flex flex-col shadow-basic px-4 py-2 min-w-72'> 
            <h3 className='font-bold text-label text-secondary text-center md:text-start'>{plan.name}</h3>
            <span className='font-bold text-h3 text-textPrimary text-center md:text-start'>{plan.monthlyPrice} ل.س</span>
            
            {/* 👈 Updated string to display dynamic day numbers instead of hardcoded "/1" */}
            <span className='text-caption text-textSecondary text-center md:text-start font-medium'>
                {`من ${today.getDate()}/${today.getMonth() + 1} إلى ${oneMonthAhead.getDate()}/${oneMonthAhead.getMonth() + 1}`}
            </span>

            <div className='pt-2 my-2 border-t space-y-2 md:min-h-[109px]'>
                <span className='flex gap-2 items-center font-bold text-textSecondary text-lg'>
                    <Check className='text-accent'/>{`${plan.classesPerWeek} جلسات أسبوعيا`}
                </span>
                
                {plan.withCoach && (
                    <span className='flex gap-2 items-center font-bold text-textSecondary text-lg'>
                        <Check className='text-accent'/> مع مدرب
                    </span>
                )}
                
                {plan.withPaddles && (
                    <span className='flex gap-2 items-center font-bold text-textSecondary text-lg'>
                        <Check className='text-accent'/> مع مضارب
                    </span>
                )}
            </div>

            <button 
                onClick={handleSubscribe}
                disabled={loading} 
                className='filled-button text-lead !py-2 !bg-secondary !rounded-xl hover:!bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed'
            >
                {loading ? "جاري الاشتراك..." : "اشترك الآن"}
            </button>
        </div>
    );
};

export default PlanCard;
