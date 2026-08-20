interface Invoice {
id: string;
amount: number;
status: "PAID" | "UNPAID";
createdAt: string;
paidAt?: string | null; // optional original payment timestamp if you still use it
confirmedAt?: string | null; // when status changed from UNPAID -> PAID


user: { name: string };
// invoice is either linked to a reservation OR a subscription (one of them will be present)
reservation?: { type?: string; durationMinutes?: number } | null;
subscription?: { name?: string; duration?: string } | null;
}

import { Prisma } from "@prisma/client";

// 1. Define the exact database selection query layout
const reservationWithInvoiceArgs = Prisma.validator<Prisma.ReservationDefaultArgs>()({
  include: {
    invoice: {
      select: {
        amount: true,
        status: true,
      },
    },
  },
});

// 2. Extract the actual TypeScript structural type from that argument model
export type ReservationWithInvoice = Prisma.ReservationGetPayload<typeof reservationWithInvoiceArgs>;

const reservationWithInvoiceAndUserArgs = Prisma.validator<Prisma.ReservationDefaultArgs>()({
  include: {
    invoice: {
      select: {
        amount: true,
        status: true,
        id: true,
      },
    },
    user: {
      select: { 
        fullName: true, 
        email: true 
      },
    },
    planVariant : {
      select: {
        displayName : true,
      }
    }
  },
});

// 2. Extract the actual TypeScript structural type from that argument model
export type ReservationWithInvoiceAndUser = Prisma.ReservationGetPayload<typeof reservationWithInvoiceAndUserArgs>;

const invoiceWithReservationAndUserArgs = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
  include: {
    reservation: {
      select: {
        duration: true,
        isSubscription: true,
      },
    },
    user: {
      select: { 
        fullName: true, 
        email: true 
      },
    },
  },
});

// 2. Extract the actual TypeScript structural type from that argument model
export type InvoiceWithReservationAndUser = Prisma.InvoiceGetPayload<typeof invoiceWithReservationAndUserArgs>;

const PlayerActiveSubscriptionArgs = Prisma.validator<Prisma.SubscriptionDefaultArgs>()({
  include: {
          planVariant: { include: { plan: true, schedules: true } },
          invoices: { select: { status: true, amount: true } },
        }
});

// 2. Extract the actual TypeScript structural type from that argument model
export type PlayerActiveSubscription  = Prisma.SubscriptionGetPayload<typeof PlayerActiveSubscriptionArgs>;





// interface SubscriptionPlan {
//   id: string;
//   name: string; // Arabic plan name
//   classesPerWeek: number;
//   monthlyPrice: number;
//   createdAt: Date;
//   subscriptions: any[]; // Replace with actual Subscription type if defined
// }

export type {Invoice}