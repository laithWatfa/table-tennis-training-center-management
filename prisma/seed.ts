import "dotenv/config"
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

function yearsAgo(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ---------- USERS ----------
  // const users = await prisma.user.createMany({
  //   data: [
  //     {
  //       fullName: "يوسف حمامة",
  //       email: "yousef@test.com",
  //       password: "hashed-password",
  //       dateOfBirth: yearsAgo(12),
  //     },
  //     {
  //       fullName: "عمر الخطيب",
  //       email: "omar@test.com",
  //       password: "hashed-password",
  //       dateOfBirth: yearsAgo(15),
  //     },
  //     {
  //       fullName: "ليث النجار",
  //       email: "laith@test.com",
  //       password: "hashed-password",
  //       dateOfBirth: yearsAgo(20),
  //     },
  //   ],
  // });


  for (const u of [
      {
        fullName: "يوسف حمامة",
        email: "yousef@test.com",
        password: "hashed-password",
        dateOfBirth: yearsAgo(12),
      },
      {
        fullName: "عمر الخطيب",
        email: "omar@test.com",
        password: "hashed-password",
        dateOfBirth: yearsAgo(15),
      },
      {
        fullName: "ليث النجار",
        email: "laith@test.com",
        password: "hashed-password",
        dateOfBirth: yearsAgo(20),
      },
    ]) {
  await prisma.user.create({ data: u });
}

  const allUsers = await prisma.user.findMany();

  // ---------- SUBSCRIPTION PLANS ----------
  const basic = await prisma.subscriptionPlan.create({
    data: {
      name: "Basic",
      classesPerWeek: 2,
      monthlyPrice: 150000,
    },
  });

  const premium = await prisma.subscriptionPlan.create({
    data: {
      name: "Premium",
      classesPerWeek: 4,
      monthlyPrice: 250000,
    },
  });

  // ---------- AGE GROUPS ----------
  const u13 = await prisma.ageGroup.create({
    data: {
      name: "U13",
      minAge: 8,
      maxAge: 13,
    },
  });

  const u16 = await prisma.ageGroup.create({
    data: {
      name: "U16",
      minAge: 14,
      maxAge: 16,
    },
  });

  const adults = await prisma.ageGroup.create({
    data: {
      name: "Adults",
      minAge: 17,
      maxAge: 40,
    },
  });

  // ---------- PLAN VARIANTS ----------
  const basicU13 = await prisma.planVariant.create({
    data: {
      planId: basic.id,
      ageGroupId: u13.id,
      displayName: "Basic - U13",
    },
  });

  const premiumU13 = await prisma.planVariant.create({
    data: {
      planId: premium.id,
      ageGroupId: u13.id,
      displayName: "Premium - U13",
    },
  });

  const premiumU16 = await prisma.planVariant.create({
    data: {
      planId: premium.id,
      ageGroupId: u16.id,
      displayName: "Premium - U16",
    },
  });

  const premiumAdults = await prisma.planVariant.create({
    data: {
      planId: premium.id,
      ageGroupId: adults.id,
      displayName: "Premium - Adults",
    },
  });

  // ---------- GROUP SCHEDULES ----------
  await prisma.groupSchedule.createMany({
    data: [
      { ageGroupId: u13.id, dayOfWeek: 0, startMin: 16 * 60, duration: 90 },
      { ageGroupId: u13.id, dayOfWeek: 2, startMin: 16 * 60, duration: 90 },

      { ageGroupId: u16.id, dayOfWeek: 1, startMin: 17 * 60, duration: 90 },
      { ageGroupId: u16.id, dayOfWeek: 3, startMin: 17 * 60, duration: 90 },

      { ageGroupId: adults.id, dayOfWeek: 4, startMin: 19 * 60, duration: 120 },
    ],
  });

  // ---------- SUBSCRIPTIONS ----------
  const subs = [];

  subs.push(
    await prisma.subscription.create({
      data: {
        userId: allUsers[0].id,
        planVariantId: premiumU13.id,
      },
    })
  );

  subs.push(
    await prisma.subscription.create({
      data: {
        userId: allUsers[1].id,
        planVariantId: premiumU16.id,
      },
    })
  );

  subs.push(
    await prisma.subscription.create({
      data: {
        userId: allUsers[2].id,
        planVariantId: premiumAdults.id,
      },
    })
  );

  // ---------- GROUP MEMBERS ----------
  await prisma.groupMember.createMany({
    data: [
      {
        userId: allUsers[0].id,
        ageGroupId: u13.id,
        subscriptionId: subs[0].id,
      },
      {
        userId: allUsers[1].id,
        ageGroupId: u16.id,
        subscriptionId: subs[1].id,
      },
      {
        userId: allUsers[2].id,
        ageGroupId: adults.id,
        subscriptionId: subs[2].id,
      },
    ],
  });

  // ---------- SUBSCRIPTION INVOICES ----------
  for (const sub of subs) {
    await prisma.invoice.create({
      data: {
        userId: sub.userId,
        subscriptionId: sub.id,
        amount: 250000,
        status: "PAID",
        paidAt: new Date(),
      },
    });
  }

  // ---------- PRIVATE RESERVATION ----------
  const reservation = await prisma.reservation.create({
    data: {
      userId: allUsers[0].id,
      title: "حصة خاصة",
      date: new Date(),
      startHour: 16,
      duration: 60,
      withCoach: true,
      withPaddles: false,
    },
  });

  await prisma.invoice.create({
    data: {
      userId: allUsers[0].id,
      reservationId: reservation.id,
      amount: 50000,
      status: "UNPAID",
    },
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
