import { Cellphone, Email, Facebook, Instagram, Location, Phone, Whatsapp } from '@/icons'
import Image from 'next/image'
import React from 'react'


const ContactUs = () => {
return (
    <div className='relative px-4 lg:px-0 py-8 flex items-start justify-center md:justify-between 
    bg-secondary dark:bg-surface lg:pr-16 '>

    <div className='content'>
        <h2 className='text-h1 font-bold text-whiteT'>تواصل معنا</h2>
        
        <div className='flex flex-col md:flex-row  justify-between gap-4'>
            <div className='visit-us text-white'>
            <h3 className='text-lead font-bold mb-2'>
                زورونا في المركز
            </h3>
            <div className='flex gap-2'>
                <Location className='w-6 h-6'/>
                <p>
                    صالة السنديان ,<br />
                    شارع الماركات، مقابل مقهى ستيفانوس <br/>      
                    مصياف،حماه،سوريا        
                </p>
            </div>
        </div>
        <div className='contact-us text-whiteT flex flex-col gap-2'>
            <h3 className='text-lead font-bold'>
                هل لديك سؤال؟ تحدث معنا
            </h3>
            
            <div className='flex gap-2 items-center'>
                <Phone className='w-6 h-6'/>
                <p dir='ltr'>
                    033 7716 789
                </p>
            </div>
            <div className='flex gap-2 items-center'>
                <Cellphone className='w-6 h-6'/>
                <p dir='ltr'>
                    0999 123 456
                </p>
            </div>
            <div className='flex gap-2 items-center'>
                <Email className='w-6 h-6 fill-whiteT'/>
                <p>
                    info@alihamamehcenter.com
                </p>
            </div>
        </div>

        </div>

        <div className='socials flex justify-center items-center gap-8 mt-10 h-8 '>
            <a href="
            ">
                <Facebook className='w-6 h-6  fill-whiteT duration-300 hover:w-7 hover:h-7 hover:fill-secondary hover:stroke-whiteT'/>
            </a>
            <a href="
            ">
                <Whatsapp className='w-6 h-6 fill-whiteT duration-300 hover:w-7 hover:h-7 hover:fill-accent'/>
            </a>
            <a href="
            " className=''>
                <Instagram className='w-6 h-6 fill-whiteT duration-300 hover:fill-amber hover:w-7 hover:h-7'/>
            </a>
            
        </div>
    </div>        
    
    <Image 
        src="/contact-us.png" width={400} height={400} alt="Hala Hamameh Image" 
        className=' hidden lg:block absolute left-0 top-1/2 translate-y-[-50%] object-cover h-5/6 rounded-r-[36px] shadow-hero'/>
    </div>
)
}

export default ContactUs