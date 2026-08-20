"use client"
import WeeklyCalendar from '@/components/manager/Calednar'
import { ReservationForm } from '@/components/manager/forms'
import { MobileCalendar } from '@/components/manager/MobileCalendar'
import SundayCalendarInput from '@/components/manager/SundayCalendarInput'
import { Plus, Arrow } from '@/icons'
import { useState, useEffect } from 'react'
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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


const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get the Sunday of the week for a given date string
const getSundayOfWeek = (dateStr: string) => {
  const chosenDate = new Date(dateStr);
  const dayOfWeek = chosenDate.getDay();
  if (dayOfWeek !== 0) {
    chosenDate.setDate(chosenDate.getDate() - dayOfWeek);
  }
  return formatLocalDate(chosenDate);
};
const ReservationPage = () => {

  const [showForm,setShowForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date();
    return formatLocalDate(today);
  });

  const [selectedSunday, setSelectedSunday] = useState<string>(() => {
    const today = new Date();
    const todayStr = formatLocalDate(today);
    return getSundayOfWeek(todayStr);
  });
  const [selectedTable, setSelectedTable] = useState("1")
  const [isMobile, setIsMobile] = useState(false);
  const [totalTablesCount, setTotalTablesCount] = useState<number>(2); // Default fallback safe value
  
  useEffect(() => {
  async function loadVenueSettings() {
      try {
      const res = await fetch("/api/manager/settings");
      if (res.ok) {
          console.log("tables number is ", res)
          const data = await res.json();
          setTotalTablesCount(data.totalTables || 2);
      }
      } catch (err) {
      console.error("Failed loading venue configuration settings:", err);
      }
  }
  loadVenueSettings();
  }, []);

    useEffect(() => {
    // const today = new Date();
    // const todayStr = formatLocalDate(today);
    // const sundayStr = getSundayOfWeek(todayStr);
    // // setSelectedDay(todayStr);
    // // setSelectedSunday(sundayStr);
    const checkViewport = () => setIsMobile(window.innerWidth < 768); 
    checkViewport(); // Check instantly on mount
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const handleDateSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (!dateStr) return;

    setSelectedDay(dateStr); // Save raw day selection for the mobile endpoint
    setSelectedSunday(getSundayOfWeek(dateStr));
  };

  const apiUrl = !selectedDay 
    ? null // SWR will not fetch if the URL is null
    : isMobile
      ? `/api/manager/reservations/day?date=${selectedDay}&table=${selectedTable}`
      : `/api/manager/reservations?sundayDate=${selectedSunday}&table=${selectedTable}`;

  const { data, isLoading, mutate } = useSWR(apiUrl,fetcher, {
    revalidateOnFocus: false , 
    dedupingInterval: 5000, 
  });

  return (
    <>
      {/* <h1 className='hidden md:block text-h2 font-bold  text-textPrimary'>الحجوزات</h1> */}
      <section>
        <div className='flex flex-col sm:flex-row sm:justify-between gap-4 items-start bg-surface p-4 mb-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800'>
          <SundayCalendarInput value={selectedSunday} onChange={setSelectedSunday}/>
            <div className="flex flex-col gap-1 w-full max-w-xs md:hidden">
                <label htmlFor="date-picker" className="font-bold text-small text-textPrimary">
                    اختر اليوم المطلوب  :
                </label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDay}
                    onChange={handleDateSelection}
                    className="w-full px-4 py-2 text-textSecondary border border-textSecondary rounded-lg bg-surface focus:outline-primary appearance-none"
                />
            </div>
          <div className="relative flex flex-col gap-1 w-full max-w-[200px]">
              <label htmlFor="table-filter" className="font-bold text-small text-textPrimary">تصفية حسب الطاولة</label>
              <div className="relative">
                <select
                  id="table-filter"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-textSecondary border border-textSecondary rounded-lg bg-surface appearance-none focus:outline-none"
                >
                  {Array.from({ length: totalTablesCount }, (_, index) => {
                      const tableValue = index + 1;
                      // Fallback gracefully to standard numerical text notation if total tables exceed 10 slots
                      const arabicLabel = ARABIC_TABLE_NAMES[index] || `الطاولة رقم ${tableValue}`;

                      return (
                      <option key={tableValue} value={tableValue}>
                          الطاولة {arabicLabel}
                      </option>
                      );
                  })}
                </select>
                {/* Optional visual anchor arrow placement helper */}
                <Arrow className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
              </div>
            </div>
        </div>
        <button 
        className='!flex !items-center filled-button !bg-secondary !py-1 !px-4 !text-lead mr-10 mb-4'
        onClick={()=>setShowForm(true)}
        >
          <Plus/>
          إضافة حجز   
        </button>
              {!selectedDay || isLoading ? (
          <p className="text-center font-bold text-textSecondary py-10">جاري تحميل الحجوزات المحددة...</p>
        ) : data?.reservations?.length > 0 ? (
          <div className="space-y-2">
            {!isMobile ? data.meta && (
              <p className='text-h3 font-bold text-textSecondary mb-2'>
                من تاريخ {data.meta.weekStart} إلى {data.meta.weekEnd} ({data.meta.totalReservations} حجز)
              </p>
            ) : <p className='text-h3 font-bold text-textSecondary mb-2'>
                            {new Date(selectedDay).toLocaleDateString("ar", {weekday: "long"})}
            {` ${new Date(selectedDay).getMonth() + 1}/${new Date(selectedDay).getDate()}`} ({data.meta.totalReservations} حجز)
              </p> }
          
              <WeeklyCalendar reservations={data.reservations} selectedSunday={selectedSunday}/>
            
              <MobileCalendar reservations={data.reservations}/>

          </div>
        ) : (
          <p className='text-center font-bold text-textSecondary text-h3 py-20 w-full'>
            {isMobile ? "لا توجد حجوزات مسجلة في هذا اليوم لهذه الطاولة." : "لا توجد حجوزات مسجلة في هذا الأسبوع لهذه الطاولة."}
          </p>
        )}
      
      </section>
      
      {showForm && <ReservationForm setShow={setShowForm} onReservationAdded={mutate}/>}
    </>
  )
}

export default ReservationPage