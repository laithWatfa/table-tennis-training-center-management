import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
const { searchParams } = new URL(request.url);
const dateStr = searchParams.get("date");
const table = searchParams.get("table");
const durationStr = searchParams.get("duration") || "60";

if (!dateStr || !table) {
return NextResponse.json({ error: "Missing date or table" }, { status: 400 });
}

try {
const targetDate = new Date(dateStr);
const requestedDurationHours = Number(durationStr) / 60

const settings = await prisma.venueSetting.findUnique({ where: { id: "global-config" } });

const end = settings?.closeHour || 10;
const start = settings?.openHour || 23;
// Define your venue's operating hours (e.g., 24-hour format from 10:00 to 22:00)
const operatingHours = Array.from({ length: end - start + 1 }, (_, i) => start + i);;

// Query existing reservations matching this table and day
const existingReservations = await prisma.reservation.findMany({
    where: {
    table: +table,
    date: {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lte: new Date(targetDate.setHours(23, 59, 59, 999)),
    },
    },
    select: {
    startHour: true,
    duration: true,
    },
});

// Identify which hours are blocked based on start hour + duration
const reservedRanges = existingReservations.map((res) => {
      const durationHours = res.duration / 60;
      return {
        start: res.startHour,
        end: res.startHour + durationHours,
      };
    });

    // 3. Filter operating hours based on whether the whole session duration fits safely
    const availableHours = operatingHours.filter((currentHour) => {
      const proposedStart = currentHour;
      const proposedEnd = currentHour + requestedDurationHours;

      // Rule A: Does it spill outside business hours?
      const maxVenueHour = Math.max(...operatingHours) + 1; // e.g., if last slot starts at 22, venue closes at 23
      if (proposedEnd > maxVenueHour) {
        return false;
      }

      // Rule B: Does this proposed block overlap with ANY existing reservation?
      const hasOverlap = reservedRanges.some((reserved) => {
        // Overlap formula: Math.max(start1, start2) < Math.min(end1, end2)
        return Math.max(proposedStart, reserved.start) < Math.min(proposedEnd, reserved.end);
      });

      return !hasOverlap; // If there is an overlap, drop this hour from available list
    });

return NextResponse.json(availableHours);
} catch (error) {
console.error("Error fetching slots:", error);
return NextResponse.json({ error: "Server error" }, { status: 500 });
}
}
