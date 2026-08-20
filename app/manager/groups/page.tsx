"use client"
import useSWR from "swr";
import { PlansSwiper } from '@/components/manager'
import GroupsTable from '@/components/manager/GroupsTable'
import { Plus } from '@/icons'
import React, { useState } from 'react'
// import { mockGroups } from '@/mockData'
import PlanForm from '@/components/manager/forms/PlanForm'
const fetcher = (url: string) => fetch(url).then((res) => res.json());


const Groups = () => {
  const { data: groups, isLoading } = useSWR("/api/manager/plan-variants", fetcher);
  const [showForm , setShowFrom] = useState(false)
  return (
    <>

      <section>
        <h2 className='text-h3 font-bold text-textSecondary mb-2'>الاشتراكات الحالية</h2>
        <button 
          className='!flex !items-center filled-button !bg-secondary !py-1 !px-4 !text-lead mr-10 '
          onClick={()=>setShowFrom(true)}
        >
          <Plus/>
          إضافة خطة   
        </button>
      <PlansSwiper/>

      </section>
      <section>
        <h2 className='text-h3 font-bold text-textSecondary mb-2'>المجموعات</h2>
                {isLoading ?  (
          <p className="text-sm text-textSecondary text-center py-6 animate-pulse">جاري تحميل كشوفات المجموعات...</p>
        ) : (
          <GroupsTable groups={groups || []} /> 
        )}
        {/* <GroupsTable groups={mockGroups}/> */}
      </section>
      {showForm && <PlanForm setShow={setShowFrom}/>}
    </>
  )
}

export default Groups