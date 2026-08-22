"use client"
import { Check, Filters } from '@/icons'
import { InvoiceStatus } from "@prisma/client";
import React, { useState } from 'react'

export interface FiltersState { 
  status: InvoiceStatus | null; 
  withCoach: boolean | null; 
  withPaddles: boolean | null; 
  past: boolean | null; 
  pm: boolean | null; 
}
interface props {
  filters : FiltersState
  setFilters : React.Dispatch<React.SetStateAction<FiltersState>>
}

const FilterBy = ({filters , setFilters} : props ) => {
  const [showForm , setShowForm] = useState<boolean>(false)

  return (
    <div className='relative '>
        
        <div
          className={`flex items-end gap-2 cursor-pointer mb-2 w-fit py-2 px-6 border-2 duration-150 rounded  ${showForm ? "border-secondary text-secondary" : "border-textSecondary"}`}
          onClick={() => setShowForm(!showForm)}>
            <Filters className='w-5 h-5'/>
          فرز
        </div>
        {
          showForm && 
          <form className='absolute z-[49] border dark:border-[3px] border-secondary rounded-lg py-2 px-4 text-textSecondary bg-surface shadow-basic 
          w-fit '>
            <button className='absolute text-[12px] font-bold text-primary left-2 top-2' onClick={() => {setFilters({
              status : null ,
              withCoach :null,
              withPaddles : null, 
              past  : null , 
              pm : null ,
            })}}>إعادة ضبط</button>
            <h3 className='text-lead font-bold mb-2'>
              حالة الفاتورة
            </h3>
            <div className='flex  items-center justify-start gap-2'>
              <label className=' '>
                <input type="radio" name="status" className='peer hidden' value={filters.status ?? ""} 
                onChange={() => {setFilters(prev => ({  ...prev ,  status : "PAID"  })) }}  />
                <span className='flex gap-2 text-nowrap bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2
                    duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary
                '>
                  {filters.status == "PAID" ? <Check/> : <></> }
                  مدفوعة</span>
                
              </label>
              <label className=''>
                <input type="radio" name="status" className='peer hidden' value={filters.status ?? ""} 
                onChange={() => {setFilters(prev => ({...prev ,  status : "UNPAID" })) }}  />
                <span className='flex gap-2 text-nowrap bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2 
                duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary'>
                  {filters.status == "UNPAID" ? <Check/> : <></> }
                  غير مدفوعة</span>
                
              </label>
              
            </div>

            <h3 className='text-lead font-bold mb-2'>
              تفاصيل الحجز
            </h3>
            <div className='flex mb-2  items-center justify-start gap-2'>
              <label className=' '>
                <input type="radio" name="withCoach" className='peer hidden'  
                onChange={() => {setFilters(prev => ({  ...prev ,  withCoach : true  })) }}  />
                <span className='flex gap-2 text-nowrap bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2
                    duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary
                '>
                  {filters.withCoach ? <Check/> : <></> }
                  مع مدرب</span>
                
              </label>
              <label className=''>
                <input type="radio" name="withCoach" className='peer hidden' 
                onChange={() => {setFilters(prev => ({...prev ,  withCoach : false })) }}  />
                <span className='flex gap-2 text-nowrap bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2 
                duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary'>
                  {filters.withCoach === false ? <Check/> : <></> }
                  بلا مدرب</span>
                
              </label>
              
            </div>

             <div className='flex  items-center justify-start gap-2'>
              <label className=' '>
                <input type="radio" name="withPaddles" className='peer hidden'  
                onChange={() => {setFilters(prev => ({  ...prev ,  withPaddles : true  })) }}  />
                <span className='flex text-nowrap gap-2 bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2
                    duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary
                '>
                  {filters.withPaddles ? <Check/> : <></> }
                  مع مضارب</span>
                
              </label>
              <label className=''>
                <input type="radio" name="withPaddles" className='peer hidden' 
                onChange={() => {setFilters(prev => ({...prev ,  withPaddles : false })) }}  />
                <span className='flex text-nowrap  gap-2 bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2 
                duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary'>
                  {filters.withPaddles == false ? <Check/> : <></> }
                  بلا مضارب</span>
                
              </label>
              
            </div>



                        <h3 className='text-lead font-bold mb-2'>
              موعد الحجز
            </h3>
            <div className='flex mb-2  items-center justify-start gap-2'>
              <label className=' '>
                <input type="radio" name="past" className='peer hidden'  
                onChange={() => {setFilters(prev => ({  ...prev ,  past : false  })) }}  />
                <span className='flex text-nowrap gap-2 bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2
                    duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary
                '>
                  {filters.past ? <Check/> : <></> }
                  حجز قادم</span>
                
              </label>
              <label className=''>
                <input type="radio" name="past" className='peer hidden' 
                onChange={() => {setFilters(prev => ({...prev ,  past : true })) }}  />
                <span className='flex gap-2 text-nowrap bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2 
                duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary'>
                  { filters.past === false? <Check/> : <></> }
                  حجز سابق</span>
                
              </label>
              
            </div>

             <div className='flex  items-center justify-start gap-2'>
              <label className=' '>
                <input type="radio" name="pm" className='peer hidden'  
                onChange={() => {setFilters(prev => ({  ...prev ,  pm : true  })) }}  />
                <span className='flex text-nowrap gap-2 bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2
                    duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary
                '>
                  {filters.pm ? <Check/> : <></> }
                  صباحا</span>
                
              </label>
              <label className=''>
                <input type="radio" name="pm" className='peer hidden' 
                onChange={() => {setFilters(prev => ({...prev ,  pm : false })) }}  />
                <span className='flex text-nowrap  gap-2 bg-bg  border border-textSecondary rounded-full ml-2 py-1 px-2 
                duration-75 peer-checked:border-secondary peer-checked:shadow-small peer-checked:text-secondary'>
                  {filters.pm === false ? <Check/> : <></> }
                  مساء</span>
                
              </label>
              
            </div>
        </form> 
        }
        
    </div>
  )
}

export default FilterBy