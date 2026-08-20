"use client"
import { InvoiceForm } from '@/components/manager/forms';
import InvoiceList from '@/components/manager/InvocieList';
import MobileInvoiceStats from '@/components/manager/MobilInoviceStats'
import RadioButtons from '@/components/manager/RadioButtons';
import SortBySelect from '@/components/manager/SortBySelect';
import UserAutocomplete from '@/components/manager/UserAutocomplete';
import { Plus } from '@/icons'
// import { mockInvoices } from '@/mockData';
import { useState } from 'react'
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const filters = [
    { id: "", label: "كل الفواتير" },
    { id: "PAID", label: "مدفوعة" },
    { id: "UNPAID", label: "غير مدفوعة" },
];

const sortByoOptions = [
    // { value: "name", label: "الاسم" },
    { value: "createdAt", label: "من الأحدث للأقدم" },
    { value: "amount", label: "القيمة" },
];

const Invoices = () => {
    const [showFrom,setShowForm] = useState(false);
    const [filter,setFilter] = useState("");
    const [sortBy,setSortBy] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    const { data, error, isLoading, mutate } = useSWR(`/api/manager/invoices?status=${filter}&userId=${selectedUserId}&orderBy=${sortBy}`,fetcher)


    return (
    <div className='md:pt-8 lg:pt-0 md:mt-12'>
        <MobileInvoiceStats/>
        {/* <div className='relative mt-4'>
            <Search className='absolute right-2 bottom-1/2 translate-y-1/2  '/>
            <input type="text" name="search" id="" className=' w-full md:w-1/4 pr-8' placeholder='البحث بالاسم' />
        </div> */}
        <UserAutocomplete currentUserId={selectedUserId} onUserSelect={setSelectedUserId} classes='max-w-xs mt-4'/>

        

        <div className='flex gap-2 w-full items-center justify-between flex-wrap mt-4'>

            <button className='filled-button  !bg-secondary flex items-center !py-1 order'
            onClick={() => setShowForm(true)}>
                <Plus className=''/>
                إضافة فاتورة
            </button>


            <SortBySelect options={sortByoOptions} value={sortBy} onChange={setSortBy} />

 
            <RadioButtons options={filters} value={filter} onChange={setFilter} classes='md:order-2 shadow-basic mx-auto sm:mx-0 ' />

        </div>

        { isLoading ? (
                <p className="text-center font-bold text-textSecondary py-10">جاري تحميل  الفواتير...</p>
            ) :  data?.invoices?.length > 0 ? <InvoiceList invoices={data.invoices} onStatusUpdated={mutate}/> : (
                <p className='text-center font-bold text-textSecondary text-h3 py-20 w-full'>
                    لا توجد فواتير.
                </p>
                )}
        
        {showFrom && <InvoiceForm setShow={setShowForm}/> }
        

    </div>
  )
}

export default Invoices