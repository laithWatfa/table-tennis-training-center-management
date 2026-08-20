"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Email } from '@/icons'
import { registerUser } from '@/app/actions/signup' // Update this path to where your action file is saved

const SignUp = () => {
const router = useRouter();
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    

    if(email.includes("@local.com")) {
        setError("البريد الإلكتروني غير صالح");
        setLoading(false);
        return;
    } 


    // Front-end confirmation check
    if (password !== confirmPassword) {
    setError("كلمات المرور غير متطابقة");
    setLoading(false);
    return;
    }

    // Call server action
    const result = await registerUser(formData);

    if (result?.error) {
    setError(result.error);
    setLoading(false);
    } else if (result?.success) {
    router.push("/sign-in"); // Redirect user to login page after successful registration
    }
};

return (
    <div className='h-screen flex bg-background'>
        <div className='w-full lg:w-1/2 flex flex-col items-center justify-center'>
        <Image src="/logo.svg" width={3000} height={3000} alt="logo" className='w-24 h-25 -mb-4'/>
        <h1 className='text-primary font-bold stroke-2 text-h2 lg:text-h1'>صالة السنديان</h1>
        <h2 className='text-textPrimary font-bold text-h3 lg:text-h2'>جاهز للانطلاق؟</h2>
        <p className='text-textSecondary text-small mt-1'>لديك حساب بالفعل؟ <Link href={"/sign-in"} className='text-primary duration-150 hover:text-secondary'>تسجيل الدخول.</Link></p>

        {/* Display feedback to the user */}
        {error && <p className="text-red-500 font-bold mt-4 text-small">{error}</p>}

        <form onSubmit={handleSubmit} className='flex flex-col gap-2 text-textPrimary mt-5 w-1/2'>
            <label htmlFor="fullName" className='font-bold'>الاسم الكامل</label>
            <div className='relative'>
                <input type="text" name="fullName" id="fullName" required className='pl-2 w-full' />
            </div>

            <label htmlFor="dateOfBirth" className='font-bold'>تاريخ الميلاد</label>
            <div className='relative'>
                <input type="date" name="dateOfBirth" id="dateOfBirth" required className='pl-2 w-full text-textSecondary' />
            </div>

            <label htmlFor="email" className='font-bold'>البريد الإلكتروني</label>
            <div className='relative'>
                <input type="email" name="email" id="email" placeholder='example@gmail.com' dir='ltr' required className='pl-8 w-full' />
                <Email className='absolute left-2  bottom-1/2 translate-y-1/2  fill-textSecondary w-5 h-5'/>
            </div>

            <label htmlFor="password" className='font-bold'>كلمة المرور</label>
            <div className='relative'>
                <input type="password" name="password" id="password" placeholder='********' dir='ltr' required className='pl-8 w-full' />
                <Email className='absolute left-2  bottom-1/2 translate-y-1/2  fill-textSecondary w-5 h-5'/>
            </div>

            <label htmlFor="confirmPassword" className='font-bold'>تأكيد كلمة المرور</label>
            <div className='relative'>
                <input type="password" name="confirmPassword" id="confirmPassword" placeholder='********' dir='ltr' required className='pl-8 w-full' />
                <Email className='absolute left-2  bottom-1/2 translate-y-1/2  fill-textSecondary w-5 h-5'/>
            </div>
            
            <button type="submit" disabled={loading} className='filled-button mt-4 disabled:opacity-50'>
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
        </form>
        </div>

        <div className='h-full w-1/2 relative hidden lg:block shadow-signup'>
            <div className="absolute inset-0 bg-custom-gradient  animate-pulse-gradient"></div>
            <Image src="/sign-up.jpg" width={3000} height={3000} alt="table tennis player" className='object-fit h-screen' />
            <span
                style={{ textShadow: '0px 8px 4px rgba(0,0,0,0.7)' }}
                className='w-full text-shadow-lg  absolute text-center text-whiteT bottom-24 text-h1 font-bold left-1/2 -translate-x-1/2'>
                “ ابدأ اليوم<br/> واصنع غدك الرياضي.“
            </span>
        </div>
    </div>
)
}

export default SignUp
