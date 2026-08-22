"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation } from 'swiper/modules';
import { Arrow, Cancel, Check, Delete, Edit } from '@/icons';
import { useState } from 'react';
import useSWR from "swr";
import { EditPlanForm } from './forms';
import { SubscriptionPlan } from "@prisma/client";
// interface SubscriptionPlan {
// id: string;
// name: string;
// classesPerWeek: number;
// monthlyPrice: number;
// }

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PlansSwiper = () => {
const { data: plans, error, isLoading, mutate } = useSWR<SubscriptionPlan[]>(
    "/api/manager/subscription-plans",
    fetcher
);

// TRACK ACTIVE MODAL STATUS VIEWS
const [showEditForm, setShowEditForm] = useState(false);
const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);

const handleEditClick = (plan: SubscriptionPlan) => {
    setActivePlan(plan);
    setShowEditForm(true);
};

const handleDeletePlan = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف باقة "${name}"؟`);
    if (!confirmDelete) return;

    try {
    const response = await fetch(`/api/manager/subscription-plans/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("حدث خطأ أثناء الحذف");
    mutate(); 
    } catch (err: unknown) {
    if(err instanceof Error) alert(err.message);
    else alert(err);
    }
};

if (isLoading) return <p className="text-center font-bold text-textSecondary py-10">جاري تحميل باقات الاشتراك...</p>;
if (error || !Array.isArray(plans)) return <p className="text-center text-red-500 font-bold py-10">حدث خطأ أثناء تحميل الباقات</p>;

return (
    <>
    <Swiper
        modules={[Navigation]}
        spaceBetween={15}
        slidesPerView='auto'
        navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
        className='relative !py-4 md:!pr-11 w-full overflow-hidden'
    >   
        {plans.map(plan => (
        <SwiperSlide key={plan.id} className='bg-surface rounded-lg shadow-basic p-2 px-4 !w-80 '> 
            <h2 className='text-secondary text-body font-bold'>{plan.name}</h2>
            <h3 className='text-h3 font-bold border-b-2 pb-2 mb-2 border-textPrimary'>{plan.monthlyPrice.toLocaleString()} ل.س</h3>
            <div className='space-y-2'>
                <span className='flex gap-2 font-bold text-textSecondary'>
                    <Check className='text-accent'/>
                    {plan.classesPerWeek === 2 ? `جلستين أسبوعياً` : `${plan.classesPerWeek} جلسات أسبوعياً`}
                </span>
                { plan.withCoach ?  <span className='flex gap-2 font-bold text-textSecondary'>
                    <Check className='text-accent'/>
                        مع مدرب
                    </span> : <span className='flex gap-2 font-bold text-textSecondary'>
                    <Cancel/>
                        مع مدرب
                    </span> 
                }
                {
                    plan.withPaddles ? <span className='flex gap-2 font-bold text-textSecondary'>
                    <Check className='text-accent'/>
                        مع مضارب
                    </span> : <span className='flex gap-2 font-bold text-textSecondary'>
                    <Cancel/>
                        مع مضارب
                    </span>
                }
            </div>
            <div className='flex justify-between mt-4'>
            <button onClick={() => handleDeletePlan(plan.id, plan.name)} className='filled-button !rounded-xl !font-normal gap-2 !py-1 bg-red-600 hover:bg-red-700'>
                <Delete/> حذف
            </button>
            
            {/* TRIGGER COMPONENT HANDLER OVERLAY SHEET PASSED DATA ROW */}
            <button onClick={() => handleEditClick(plan)} className='filled-button !rounded-xl !font-normal gap-2 !bg-secondary hover:!bg-sky-700 !py-1'>
                <Edit/> تعديل
            </button>
            </div>
        </SwiperSlide>
        ))}

        <div className="custom-prev hidden md:flex items-center justify-center w-8 h-8 -rotate-90 z-50 absolute top-1/2 right-1 -translate-y-1/2 bg-surface border border-textSecondary rounded-full shadow-md cursor-pointer"><Arrow /></div>
        <div className="custom-next flex items-center justify-center w-8 h-8 absolute rotate-90 z-50 top-1/2 left-0 -translate-y-1/2 bg-surface border border-textSecondary rounded-full shadow-md cursor-pointer"><Arrow/></div>
    </Swiper>

    {/* RENDER MODAL CONDITIONALLY PASSING ACTIVE MUTATE AND OBJECT REFERENCES */}
    {showEditForm && activePlan && (
        <EditPlanForm 
        plan={activePlan} 
        setShow={setShowEditForm} 
        onPlanUpdated={mutate} // 👈 Links SWR to reload dynamically on form submit completion!
        />
    )}
    </>
);
}

export default PlansSwiper;
