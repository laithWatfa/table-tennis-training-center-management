"use server";

import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";


export async function registerUser(formData: FormData) {
const fullName = formData.get("fullName") as string;
const dateOfBirth = formData.get("dateOfBirth") as string;
const email = formData.get("email") as string;
const password = formData.get("password") as string;

// 1. Basic server validation
if (!fullName || !dateOfBirth || !email || !password) {
    return { error: "جميع الحقول مطلوبة" };
}

try {
    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
    where: { email },
    });

    if (existingUser) {
    return { error: "البريد الإلكتروني مستخدم بالفعل" };
    }

    // 3. Hash the password securely
    const hashedPassword = await hash(password, 12);

    // 4. Insert into Prisma database matching your User model fields
    await prisma.user.create({
    data: {
        fullName,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth), // Converts input string to DateTime object
    },
    });

    return { success: true };
} catch (error) {
    console.error("Signup error:", error);
    return { error: "حدث خطأ ما أثناء إنشاء الحساب" };
}
}
