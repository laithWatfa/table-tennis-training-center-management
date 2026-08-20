"use client"; // Ensure this is at the very top of your file

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Email } from '@/icons'
import { signIn } from "next-auth/react" // Use the client-side login method
import { useRouter } from "next/navigation"; // 1. Ensure useRouter is imported
import { getSession } from "next-auth/react"; // 2. Im


const SignIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });


      if (result?.error) {
    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    setLoading(false);
    return;
  }

  // 4. FETCH THE FRESHLY CREATED AUTHENTICATED SESSION
  const session = await getSession();
  const userRole = session?.user?.role; // Sourced safely via your next-auth.d.ts file types!

  // 5. EVALUATE CONDITIONAL ROLE PATHWAY REDIRECTS INSTANTLY
  if (userRole === "Admin") {
    router.push("/manager/reservations"); // Route for admins/managers
  } else {
    router.push("/player/reservations");   // Route for regular players
  }
  };

  return (
    <div className='h-screen flex bg-background'>
        <div className='w-full lg:w-1/2 flex flex-col items-center justify-center'>
        <Image src="/logo.svg" width={3000} height={3000} alt="logo" className='w-24 h-25 -mb-4'/>
        <h1 className='text-primary font-bold stroke-2 text-h2 lg:text-h1'>صالة السنديان</h1>
        <h2 className='text-textPrimary font-bold text-h3 lg:text-h2'>جاهز للعودة؟</h2>
        <p className='text-textSecondary text-small mt-1'>ليس لديك حساب؟ <Link href={"/sign-up"} className='text-primary duration-150 hover:text-secondary'>أنشئ حسابك.</Link></p>

        {error && <p className="text-red-500 font-bold mt-4 text-small">{error}</p>}

        {/* Changed from action={} to client onSubmit handling */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-2 text-textPrimary mt-5 w-1/2'>
            <label htmlFor="email" className='font-bold'>البريد الإلكتروني</label>
            <div className='relative'>
                {/* FIXED: Added name="email" */}
                <input type="email" name="email" id="email" placeholder='example@gmail.com' dir='ltr' required className='pl-8 w-full' />
                <Email className='absolute left-2  bottom-1/2 translate-y-1/2  fill-textSecondary w-5 h-5'/>
            </div>

            <label htmlFor="password" className='font-bold'>كلمة المرور</label>
            <div className='relative'>
                {/* FIXED: Added name="password" */}
                <input type="password" name="password" id="password" placeholder='********' dir='ltr' required className='pl-8 w-full' />
                <Email className='absolute left-2  bottom-1/2 translate-y-1/2  fill-textSecondary w-5 h-5'/>
            </div>
            
            <button type='submit' disabled={loading} className='filled-button mt-4 disabled:opacity-50'>
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
        </form>
        </div>

        <div className='h-full w-1/2 relative hidden lg:block shadow-signup'>
            <div className="absolute inset-0 bg-custom-gradient opacity-50"></div>
            <Image src="/sign-in.jpg" width={3000} height={3000} alt="table tennis player" className='object-fit h-screen' />
            <span 
                style={{ textShadow: '0px 8px 4px rgba(0,0,0,0.7)' }}
                className='w-full absolute text-center text-whiteT bottom-24 text-h1 font-bold left-1/2 -translate-x-1/2'>
                    “ النجاح يبدأ بخطوة،<br/> والإصرار يصنع الأبطال.“
            </span>
        </div>
    </div>
  )
}

export default SignIn;
