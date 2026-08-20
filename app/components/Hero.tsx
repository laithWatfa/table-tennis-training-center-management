import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Hero = () => {
    return (
        <main className='relative z-20  h-screen py-10 px-4 md:px-16 overflow-hidden bg-[linear-gradient(60deg,#0F172A_0%,#E53935_100%)]'>
            
            <Image src={"/red.png"} alt='hero image' width={1200} height={1200} className='absolute -z-10 bottom-0 left-0 w-full md:hidden lg:block lg:w-3/5'/>
            <div className='text-whiteT flex flex-col  w-full lg:w-fit justify-center lg:justify-start text-center lg:text-start'>
                <div className='flex flex-col lg:flex-row-reverse justify-center items-center'>
                    <Image src="/logo-hero.svg" width={500} height={500} alt='logo' className='w-[130px] md:w-[150px] mb-[-60px] lg:mb-0'/>
                    <h1 className='text-h1 md:text-8xl font-bold mb-5' >صالة السنديان</h1>
                </div>
                <h2 className='text-lead md:text-h2 font-bold' >مركز تنس الطاولة - حيث يبدأ الأبطال.</h2>
                <p className='text-small md:text-h3 font-light'>
                    تعلم، تدرب، وتحدى نفسك في أجواء احترافية <br/> بإشراف مدربين موثوقين.
                </p>
                <a href="#about-us"  className='outlined-button my-4 mx-auto lg:mx-0 w-full text-lead max-w-[540px]'>من نحن</a>
                


            </div>
            <div className='flex w-full mx-auto lg:mx-0 max-w-[540px] [&:has(.trigger:hover)>.prev]:bg-primary group-wrapper'>
                    <Link href="/sign-in" className=' text-small w-1/2 outlined-button !rounded-l-none !border-l-0 [&:hover+a]:bg-transparent prev'>
                    تسجيل الدخول 
                    </Link>
                    <Link href="/sign-up" className='w-1/2 outlined-button !rounded-r-none !border-r-0 bg-primary hover:bg-secondary trigger'>
                    إنشاء حساب
                    </Link>
                </div>
        
        </main>
    )
}

export default Hero