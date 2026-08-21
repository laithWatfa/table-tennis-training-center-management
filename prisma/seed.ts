// prisma/seed.ts
import { PrismaClient, Role, InvoiceStatus } from "@/app/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 🎯 CONFIGURATION RULE: The unique email designated as the master Super Admin
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@alsindyan.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "ADMIN123";

async function main() {
  console.log("🌱 Starting database seeding pipeline...");

    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_EMAIL.includes("@")) {
    console.error("❌ CRITICAL SEED ERROR: 'SUPER_ADMIN_EMAIL' is missing or invalid inside your environment variables!");
    process.exit(1);
  }


  // 1. INITIALIZE GLOBAL VENUE CONFIGURATION SETTINGS
  console.log("⚙️ Seeding global venue configurations...");
  const venueSettings = await prisma.venueSetting.upsert({
    where: { id: "global-config" },
    update: {},
    create: {
      id: "global-config",
      tableRatePerHour: 6000,      // 6,000 ل.س per table hour
      coachRatePerHour: 12000,     // 12,000 ل.س per coach hour
      paddlesFlatFee: 1000,        // 1,000 ل.س flat fee for paddles
      maxDebtLimit: 150000,        // 150,000 ل.س max unpaid balance ceiling
      openHour: 10,                // 10:00 AM opening time
      closeHour: 23,               // 11:00 PM closing time
      totalTables: 4,              // 4 active table slots dynamically mapped
      cancellationWindow: 2,       // 2 hours lockout safety window
    },
  });
  console.log("✅ Venue settings initialized successfully.");

  // 2. INITIALIZE OPERATIONAL AGE GROUPS DICTIONARY
  console.log("🏃‍♂️ Seeding baseline operational age groups...");
  const baselineAgeGroups = [
    { name: "أشبال (تحت 14 سنة)", minAge: 6, maxAge: 13 },
    { name: "شباب (14 - 18 سنة)", minAge: 14, maxAge: 18 },
    { name: "كبار (+18 سنة)", minAge: 19, maxAge: 99 },
  ];

  for (const group of baselineAgeGroups) {
    await prisma.ageGroup.create({
      data: {
        name: group.name,
        minAge: group.minAge,
        maxAge: group.maxAge,
      },
    });
  }
  console.log(`✅ ${baselineAgeGroups.length} baseline age groups seeded successfully.`);

  // 3. INITIALIZE SECURE SUPER ADMIN OWNER ACCOUNT
  console.log("👑 Seeding master Super Admin account profile...");
  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {},
    create: {
      fullName: "المالك الرئيسي للنظام",
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      dateOfBirth: new Date("1990-01-01"),
      role: Role.Admin, // Grants access to restricted endpoints
    },
  });
  console.log(`✅ Master Super Admin initialized safely at email: ${superAdmin.email}`);

  console.log("🚀 Database seeding completed flawlessly!");
}

main()
  .catch((e) => {
    console.error("❌ CRITICAL ERROR ENCOUNTERED DURING SEED PIPELINE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
