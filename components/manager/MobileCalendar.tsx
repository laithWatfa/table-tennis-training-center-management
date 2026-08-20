"use client"

import { Check, Reservation } from "@/icons";
import { ReservationWithInvoiceAndUser } from "@/types";
import ReservationDetailsModal from "./ReservationDetailsModal";
import { useState } from "react";
export type InvoiceStatus = "PAID" | "UNPAID";

function hoursToTime(h: number) {
//   const h = Math.floor(m / 60);
  const min = h % 1 * 60;
  const period = h >= 12 ? "م" : "ص";
  const hour12 = Math.floor(h) > 12 ? Math.floor(h - 12) : Math.floor(h);
  return `${hour12}:${min.toString().padStart(2, "0")} ${period}`;
}

export function MobileCalendar({
  reservations,
}: {
  reservations: ReservationWithInvoiceAndUser[];
}) {
    const [selectedRes, setSelectedRes] = useState<ReservationWithInvoiceAndUser | null>(null);
  
  return (
    <div className="space-y-3 md:hidden" >
      {reservations.map((r) => {
        const bg = r.isSubscription
          ? "bg-textSecondary"
          : r.invoice?.status === "PAID"
          ? "bg-accent"
          : "bg-amber";

        return (
          <div
            key={r.id}
            onClick={(e) => {
              e.preventDefault();
              setSelectedRes(r); ;// Open detail modal on click action sequence
              }}
            className={`rounded-2xl px-4 py-3 text-white shadow-basic ${bg}`}
          >
            <div className="flex items-center gap-2">
                <Reservation  />
              <h3 className="font-bold truncate">{r.isSubscription ? (r.planVariant?.displayName || "مجموعة مشتركة") : r.user?.fullName}</h3>
              
            </div>

            <div className="mt-1 text-sm font-bold">

              {hoursToTime(r.startHour)} –{" "}
              {hoursToTime(r.startHour + (r.duration/60))}
            </div>

            {(r.withCoach || r.withPaddles) && (
              <div className="mt-2 flex gap-4 text-sm font-bold">
                {r.withCoach && (
                  <span className="flex items-center gap-1">
                    <Check className="text-whiteT"  />
                    مع مدرب
                  </span>
                )}
                {r.withPaddles && (
                  <span className="flex items-center gap-1">
                    <Check className="text-White" />
                    مع مضارب
                  </span> 
                )}
              </div>
            )}
          </div>
        );
      })}
      {selectedRes && (
        <ReservationDetailsModal 
          reservation={selectedRes}
          onClose = {() => setSelectedRes(null)}
        />
      )}
    </div>
  );
}
