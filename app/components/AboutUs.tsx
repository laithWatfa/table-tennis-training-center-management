import Image from 'next/image'
import React from 'react'
import {Values,Target} from "@/icons"

const AboutUs = () => {
  return (
    <div id='about-us' className='flex gap-10  bg-background py-5 px-4 lg:px-0'>
        
        <Image src="/about-us.png" width={2000} height={2000} alt="about us image" className='hidden lg:block h-96 w-[520px]'/>
        <div className='flex-1'>
            <div className='flex gap-2 justify-start lg:justify-center border-b-4 border-secondary w-fit lg:w-full lg:border-none'>
                <Image src="/blue-logo.svg" width={400} height={400} alt="logo" className='w-12 hidden lg:block'/>
                            <h2 className='text-secondary text-center text-h1 font-bold' >من نحن</h2>

                <Image src="/blue-logo.svg" width={400} height={400} alt="logo" className='w-12 rotate-[65deg]'/>
            </div>

            <div className='text-center'>
                <h3 className='flex justify-center lg:justify-start items-center gap-2 text-primary text-h2 font-bold'>
                    هدفنا
                    <Target className='w-10 fill-primary'/>
                </h3>
                <p className=' text-meta md:text-body text-center lg:text-start text-textPrimary lg:pl-10'>
                    نهدف في صالة السنديان إلى تطوير مهارات اللاعبين من جميع الأعمار والمستويات، من خلال تدريب احترافي يشرف عليه لاعب المنتخب السوري السابق علي حمامة، بمشاركة ولديه يوسف وهالة، لاعبي المنتخب السوري الحاليين. نسعى لبناء جيل جديد من الرياضيين يتمتعون بالثقة والانضباط والروح التنافسية.                
                </p>
            </div>
            <div>
                <h3 className='flex justify-center lg:justify-start items-center gap-2 text-accent text-h2 font-bold'>
                    قيمنا
                    <Values className='w-10 fill-accent'/>
                </h3>
                <p className='text-meta md:text-body text-center lg:text-start text-textPrimary lg:pl-10'>
                    نؤمن بأن الرياضة ليست مجرد منافسة، بل وسيلة لبناء الشخصية وتعزيز التعاون والاحترام. نحرص على توفير بيئة تدريبية آمنة، محفزة، وعائلية، حيث يُعامل كل لاعب كجزء من فريق واحد يسعى للتطور والتميز.
                </p>
            </div>
        </div>
    </div>
  )
}

export default AboutUs