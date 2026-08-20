"use client";
import { ReservationWithInvoiceAndUser } from "@/types";
import React, { useMemo, useState } from "react";
import ReservationDetailsModal from "./ReservationDetailsModal";

// ---------- Types ---------
const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 AM → 10:00 PM

interface CalendarProps {
  reservations: ReservationWithInvoiceAndUser[];
  selectedSunday: string; // Pass the selected "YYYY-MM-DD" Sunday string as a prop to generate accurate day dates
}
// ---------- Component ----------
export default function Calendar({
  reservations, selectedSunday
}: CalendarProps) {

  // const {mutate} = useSWRConfig();

  const [selectedRes, setSelectedRes] = useState<ReservationWithInvoiceAndUser | null>(null);
    // 1. DYNAMICALLY GENERATE THE 7 DAY STRINGS FOR THE HEADER BASED ON THE SELECTED SUNDAY
  const daysHeader = useMemo(() => {
    const baseDate = new Date(selectedSunday);
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    
    return dayNames.map((name, index) => {
      const currentDay = new Date(baseDate);
      currentDay.setDate(baseDate.getDate() + index);
      
      const dayNum = currentDay.getDate();
      const monthNum = currentDay.getMonth() + 1;
      
      return `${name} ${dayNum}/${monthNum}`;
    });
  }, [selectedSunday]);

  return (
    <div className="relative w-full">
    <div className="relative w-full overflow-x-auto rounded-xl border  shadow-basic hidden md:block">
      {/* Header */}
      <div className="grid grid-cols-[80px_repeat(7,minmax(90px,1fr))] border-b border-textSecondary bg-grayBG dark:bg-surface">
        <div />
        {daysHeader.map((day) => (
          <div
            key={day}
            className="border-r px-2 py-3 text-center text-xs lg:text-sm font-bold text-textSecondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative">
        {hours.map((hour, i) => (
          <div
            key={hour}
            className={`grid grid-cols-[80px_repeat(7,minmax(90px,1fr))]  border-textSecondary 
                h-10 bg-gradient-to-b from-surface from-50% to-grayBG dark:to-bg to-50%`}
          >
            <div className={`border-l px-2 font-bold text-textSecondary text-center text-sm `}>
              {hour <= 12 ? `${hour}:00 ص` : `${hour - 12}:00 م`}
            </div>
            {daysHeader.map((_, dIdx) => (
              <div key={dIdx} className="relative border-r" />
            ))}
          </div>
        ))}

        {/* Reservations */}
        {reservations.map((r) => {
          const resDate = new Date(r.date);
          const dayIndex = resDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
          const top = ((r.startHour - 8) * 40) + 2; 
          const height = (r.duration / 60 * 40 ) - 4;
          const right = `calc(80px + ${dayIndex} * (100% - 80px) / 7)`;
          const bg = r.isSubscription
          ? "bg-textSecondary"
          : r.invoice?.status === "PAID"
          ? "bg-accent"
          : "bg-amber";

          return (
            <div
              key={r.id}
              className={`z-10 cursor-pointer flex items-center justify-center absolute text-center 
                rounded-md md:text-xs px-1  overflow-hidden text-ellipsis  lg:text-sm font-medium shadow-basic text-white ${bg}`}
              style={{
                top,
                right,
                height,
                width: "calc((100% - 80px) / 7 - 8px)",
                marginRight: 4,
                marginLeft: 4,
              }}
              onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedRes(r); ;// Open detail modal on click action sequence
              }}
            >
              {r.isSubscription ? (r.planVariant?.displayName || "مجموعة مشتركة") : r.user?.fullName}
            </div>
          );
        })}
      </div>
    </div>

{selectedRes && (
  <ReservationDetailsModal 
    reservation={selectedRes}
    onClose = {() => setSelectedRes(null)}
  />
)}
</div> ); }
