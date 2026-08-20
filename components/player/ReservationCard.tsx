import React from 'react'
// import { CalendarReservation } from '@/mockData'
import { Bills, Cancel, Check, Coach, Month, Paddle, Table, Timer } from '@/icons'
import { ReservationWithInvoice } from '@/types';

function hoursToTime(h: number) {
//   const h = Math.floor(m / 60);
  const min = h % 1 * 60;
  const period = h >= 12 ? "م" : "ص";
  const hour12 = h > 12 ? h - 12 : Number.parseInt(`${h}`);
  return `${hour12}:${min.toString().padStart(2, "0")} ${period}`;
}

const ARABIC_TABLE_NAMES = [
    "الأولى",
    "الثانية",
    "الثالثة",
    "الرابعة",
    "الخامسة",
    "السادسة",
    "السابعة",
    "الثامنة",
    "التاسعة",
    "العاشرة"
];


const ReservationCard = ({info} : {info : ReservationWithInvoice}) => {
  
  const date = new Date(info.date)
  return (
    <div className={`bg-surface shadow-basic rounded-lg p-4 border-t-8 text-textPrimary dark:text-textSecondary font-bold ${info.invoice?.status == "UNPAID" ? "border-amber" : "border-accent"}`}>
        <div className='flex gap-2 text-h3'>
          <span className='w-auto h-auto ml-2 mt-1'><Month transform='scale(2)' className=''/></span>
            {date.toLocaleDateString("ar", {weekday: "long"})}
            {` ${date.getMonth() + 1}/${date.getDate()}`}
        </div>
        <div className='text-h2 border-b-2 border-textPrimary dark:border-textSecondary pb-1'> 
          {hoursToTime(info.startHour)}
        </div>
        <div className='space-y-1 text-lead border-b-2 border-textPrimary dark:border-textSecondary pb-1 mb-2 '>
          <div className='flex gap-2 items-center '>
            <Table/>
            {`الطاولة : ${ARABIC_TABLE_NAMES[info.table - 1] || info.table} `}
          </div>
          <div className='flex gap-2 items-center '>
            <Timer/>
            المدة : 
            {` ${info.duration} د`}
          </div>
          <div className='flex gap-2 items-center '>
            <Paddle/>
            مع مضارب :
            {info.withPaddles == true ? <Check className='text-accent'/> : <Cancel/>}
          </div>
          <div className='flex gap-2 items-center '>
            <Coach/>
            مع مدرب :
            {info.withCoach == true ? <Check className='text-accent'/> : <Cancel/>}
          </div>
        </div>
        <div className='flex gap-2 items-center '>
            <Bills/>
            قيمة الفاتورة :
            <span className={`text-surface p-1.5 rounded-full
              ${info.invoice?.status == "UNPAID" ? "bg-amber" : "bg-accent"} `}>{ `${info.invoice?.amount} ل.س`}</span>
          </div>

        
    </div>
  )
};
export default ReservationCard