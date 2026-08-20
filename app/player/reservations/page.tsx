'use client'
import { SortBy } from '@/components/player'
import FiltersBy , {FiltersState} from '@/components/player/FilterBy'
import NewReservationForm from '@/components/player/NewReservationForm'
import ReservationCard from '@/components/player/ReservationCard'
import DynamicSkeleton from '@/components/ui/DynamicSkeleton'
import { NewReservation} from '@/icons'
// import { CalendarReservation, mockReservations } from '@/mockData'
import { ReservationWithInvoice } from '@/types'
import { useState , useMemo, useRef, useEffect } from 'react'
import useSWRInfinite from "swr/infinite";
const ITEMS_PER_PAGE = 12;


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PlayerReservations = () => {
    const scrollTriggerRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<FiltersState>({ 
        status: null, 
        withCoach: null, 
        withPaddles: null, 
        past: null, 
        pm: null, });
    const [showForm,setShowForm] = useState(false);
    const [sortBy,setSortBy] = useState("date");
        // 2. DEFINE THE KEY GENERATOR FOR SWR BATCH INDEXING
    const getKey = (pageIndex: number, previousPageData: ReservationWithInvoice[]) => {
        // Stop fetching if the previous page returned no records
        if (previousPageData && !previousPageData.length) return null;
        
        // Pass page and limit parameters to your player reservations API endpoint
        return `/api/player/reservations?page=${pageIndex + 1}&limit=${ITEMS_PER_PAGE}`;
    };

    // 3. INITIALIZE THE INFINITE ENGINE
    const { data, error, size, setSize, isValidating, isLoading, mutate } = useSWRInfinite<ReservationWithInvoice[]>(
        getKey, 
        fetcher
    );

        const rawReservations = useMemo(() => {
        return data ? data.flat() : [];
    }, [data]);

    const isListEmpty = data?.[0]?.length === 0;
    const reachedEnd = isListEmpty || (data && data[data.length - 1]?.length < ITEMS_PER_PAGE);
    const isMoreLoading = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");


        useEffect(() => {
        const currentTarget = scrollTriggerRef.current;
        if (!currentTarget || reachedEnd || isMoreLoading || isValidating) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setSize((prev) => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(currentTarget);
        return () => observer.disconnect();
    }, [reachedEnd, isMoreLoading, isValidating, setSize]);
    // const { data : rawReservations, error, isLoading ,mutate} = useSWRInfinite("/api/player/reservations", fetcher);
      // Derived status: Calculates filters and sorts instantly whenever dependencies change
    const processedReservations = useMemo(() => {
        if (!rawReservations || !Array.isArray(rawReservations)) return [];

        const now = new Date();

        // 1. FILTERING STEP
        const result = rawReservations.filter((res: ReservationWithInvoice) => {
        // Filter by Status (PAID / UNPAID)
        if (filters.status && res.invoice?.status !== filters.status) return false;

        // Filter by Coach Assignment
        if (filters.withCoach !== null && res.withCoach !== filters.withCoach) return false;

        // Filter by Paddle Rental
        if (filters.withPaddles !== null && res.withPaddles !== filters.withPaddles) return false;

        // Filter by Timeline (Past vs Future Bookings)
        if (filters.past !== null) {
            const resDate = new Date(res.date);
            const isPast = resDate < now;
            if (filters.past && !isPast) return false;  // Wants past, but it's future
            if (!filters.past && isPast) return false;  // Wants future, but it's past
        }

        // Filter by Time Period (AM vs PM)
        if (filters.pm !== null) {
            const isPM = res.startHour >= 12;
            if (filters.pm && !isPM) return false;      // Wants PM, but it's AM
            if (!filters.pm && isPM) return false;      // Wants AM, but it's PM
        }

        return true;
        });

        // 2. SORTING STEP
        result.sort((a: ReservationWithInvoice, b: ReservationWithInvoice) => {
        if (sortBy === "date") {
            return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newest first
        }
        
        if (sortBy === "duration") {
            return b.duration - a.duration; // Longest duration first
        }

        if (sortBy === "amount") {
            // Accessing the nested amount from the invoice relational array we configured earlier
            const amountA = a.invoice?.amount || 0;
            const amountB = b.invoice?.amount || 0;
            return amountB - amountA; // Most expensive first
        }

        return 0;
        });

        return result;
    }, [rawReservations, filters, sortBy]);

    // if (isLoading) return <p>جاري تحميل البيانات...</p>;
    if (error) return <p>حدث خطأ أثناء تحميل البيانات</p>;

    return (
    <main>
        {showForm && <NewReservationForm setShow={setShowForm} onReservationAdded={mutate}/>}
        <div className='flex flex-col md:flex-row md:items-start  justify-between'>
            <span className='flex gap-2'>
                <FiltersBy filters={filters} setFilters={setFilters}/>
                <SortBy sortedBy={sortBy} onChange={setSortBy}/>
            </span>
            <button 
            onClick={() => setShowForm(!showForm)}
            className='h-fit z-[48] fixed bottom-6 right-6 md:relative md:bottom-0 md:right-0
            !rounded-full md:!rounded-md filled-button !p-4 md:!py-2 md:!px-6 max-w-60'>
                <NewReservation className='w-6 h-6 md:ml-2' />
                <span className='hidden md:block'>حجز جديد</span>


            </button>
        </div>
        {isLoading ? 
            <DynamicSkeleton type="reservations" cardsCount={5}/> 
            : 
                    <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
            {
                processedReservations.length > 0 
                    ? processedReservations.map( (res: ReservationWithInvoice) => <ReservationCard key={res.id} info={res}  />) 
                    : "لا يوجد حجوزات" 
            }

        </section>
        }


        <div ref={scrollTriggerRef} className="w-full text-center py-8 text-sm font-medium text-textSecondary">
                {isMoreLoading || (isValidating && data && data.length === size) ? (
                    <div className="flex items-center justify-center gap-2 animate-pulse text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-bounce"></span>
                        <span>جاري تحميل المزيد من الحجوزات...</span>
                    </div>
                ) : reachedEnd ? (
                    <p className="text-xs text-textSecondary/60 italic">✓ لا توجد حجوزات أخرى لعرضها</p>
                ) : processedReservations.length === 0 ? (
                    <p className="text-xs text-textSecondary/60">لا توجد نتائج تطابق الفلاتر الحالية</p>
                ) : (
                    <p className="opacity-0">إسحب للمزيد</p>
                )}
            </div>
                
    </main>
)
}

export default PlayerReservations