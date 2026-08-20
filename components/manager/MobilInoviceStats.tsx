"use client"
import { Arrow } from '@/icons'

import { MdCalendarMonth as Calendar } from 'react-icons/md'
import React, { useState } from 'react'
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MobileInvoiceStats = () => {
    const [filter,setFilter] = useState<string>("total")
    // const[selectedMonth,setsSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${currentMonth < 9 ? "0"+currentMonth : currentMonth}`)
    const[selectedMonth,setSelectedMonth] = useState<string>(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
        
        return `${currentYear}-${currentMonth}`
    })


  // Pass monthStr directly into SWR cache tracking variables string
    const { data, isLoading } = useSWR(
    selectedMonth ? `/api/manager/invoices/monthly-summary?monthStr=${selectedMonth}` : null,
    fetcher);
    return (<>
    <section className='flex flex-col gap-2 items-center  bg-surface w-full p-2 rounded-lg shadow-basic lg:w-1/3 lg:mx-auto md:hidden'>
        <form action="" className='flex flex-col items-center gap-2'>
            <div className='relative'>
                {/* <Month className='absolute right-2 bottom-1/2 translate-y-1/2'/> */}
                <Calendar className='absolute right-2 bottom-1/2 translate-y-1/2' />
                <input 
                    type="month" name="month" id="month" 
                    value={selectedMonth}
                    onChange={(e) => {setSelectedMonth(e.target.value)}}
                    className='!rounded-b-none border-b-textSecondary border-b-2'/>
            </div>
        </form>

        <div className='relative w-fit'>
            <Arrow className='absolute left-2 bottom-1/2 translate-y-1/2 text-textSecondary'/>
            <select name="filter" id="" value={filter} onChange={(e)=> setFilter(e.target.value)} 
            className='flex justify-center py-1 pr-2 pl-8  border border-textSecondary rounded-2xl font-bold text-textSecondary bg-surface'>
                <option value="total" className='bg-secondary text-whiteT cursor-pointer  '>إجمالي الفواتير</option>
                <option value="paid" className='bg-accent text-whiteT cursor-pointer'>الفواتير المدفوعة</option>
                <option value="unpaid" className='bg-amber text-whiteT rounded-b-md cursor-pointer'>الفواتير غير المدفوعة</option> 
            </select>
        </div>

        {isLoading ? (
            <p className="text-sm text-textSecondary animate-pulse text-center py-4">جاري تحميل الإحصائيات المالية...</p>
        ) : (
                    <h1 
        className={`font-bold text-lead ${
            filter == "paid" ? "text-accent" : filter == "unpaid" ? "text-amber" : "text-textPrimary"
        }`}
        >
            {data?.[filter]?.toLocaleString('en-US')} ل.س
        </h1>
        )}


    </section>

    <section className='relative hidden md:block bg-surface w-full p-2 rounded-lg rounded-tr-none shadow-basic'>
        <form action="" className='absolute bottom-full right-0 flex flex-col items-center gap-2'>
            <div className='relative'>
                <Calendar className='absolute  right-2 bottom-1/2 translate-y-1/2'/>
                <input type="month" name="month" id="month" 
                    value={selectedMonth}
                    onChange={(e) => {setSelectedMonth(e.target.value)}}
                    className='!rounded-b-none border-b-textSecondary border-b-2'/>
            </div>
        </form>
        {isLoading ? (
            <p className="text-sm text-textSecondary animate-pulse text-center py-4">جاري تحميل الإحصائيات المالية...</p>
        ) : (
        <div className='flex ' >
            <span className='w-1/3 flex flex-col items-center text-lead text-textSecondary border-l-2 border-textSecondary' >
                إجمالي الفواتير
                <span className='text-textPrimary font-bold text-h3' >{data?.total?.toLocaleString('en-US')} ل.س</span>
            </span>
            <span className='w-1/3 flex flex-col items-center text-lead text-textSecondary border-l-2 border-textSecondary' >
                الفواتير المدفوعة
                <span className='text-accent font-bold text-h3' >{data?.paid?.toLocaleString('en-US')}  ل.س</span>
            </span>
            <span className='w-1/3 flex flex-col items-center text-lead text-textSecondary  ' >
                الفواتير غير المدفوعة
                <span className='text-amber font-bold text-h3' >{data?.unpaid?.toLocaleString('en-US')}  ل.س</span>
            </span>
        </div>
        )}
        
    </section>
    </>
)
}

export default MobileInvoiceStats