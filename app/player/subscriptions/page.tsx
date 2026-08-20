import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import PlanCard from '@/components/player/PlanCard';
import SubscriptionCard from '@/components/player/SubscriptionCard';
import { CgArrowLeft } from 'react-icons/cg';
import { redirect } from 'next/navigation';
import { GroupSchedule, SubscriptionPlan } from '@prisma/client';
import { PlayerActiveSubscription } from '@/types';

// Helper to convert float hours to dynamic Arabic string display (e.g., 13.5 -> "1:30 م")
function formatHourArabic(hourFloat: number, durationMinutes: number): { start: string; end: string } {
  const formatTime = (h: number) => {
    const mins = Math.round((h % 1) * 60);
    const hours24 = Math.floor(h);
    const period = hours24 >= 12 ? 'م' : 'ص';
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    return `${hours12}:${mins === 0 ? '00' : mins} ${period}`;
  };

  const endHourFloat = hourFloat + (durationMinutes / 60);
  return {
    start: formatTime(hourFloat),
    end: formatTime(endHourFloat)
  };
}

// Map JavaScript/Prisma day integers (0-6) to formal Arabic Weekdays
const ARABIC_DAYS: Record<number, string> = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

export default async function PlayerSubscriptionsPage() {
  // 1. Authenticate user server-side
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;
  // 2. Fetch all three data sets concurrently from the database
  let dbPlans: SubscriptionPlan[] = [];
  let activeSubscriptions: PlayerActiveSubscription[] = [];
  let fetchError = false;

  // 1. Localized Try/Catch Block
  try {
    const now = new Date()
    const [fetchedPlans, fetchedSubs] = await Promise.all([
      prisma.subscriptionPlan.findMany({ orderBy: { monthlyPrice: 'asc' } }),
      prisma.subscription.findMany({
        where: { userId: userId , endDate: { gt: now }},
        include: {
          planVariant: { include: { plan: true, schedules: true } },
          invoices: { select: { status: true, amount: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
    ]);
    
    dbPlans = fetchedPlans;
    activeSubscriptions = fetchedSubs;
  } catch (error) {
    // Log secretly to your server monitoring dashboards (Sentry, Logtail, etc.)
    console.error("Database connection failure on subscriptions dashboard:", error);
    fetchError = true;
  }

  const formattedAvailablePlans = dbPlans.map((p) => ({
    id: p.id,
    name: p.name,
    monthlyPrice: p.monthlyPrice,
    classesPerWeek: p.classesPerWeek,
    withCoach: p.withCoach,
    withPaddles: p.withPaddles,
  }));


  return (
    <>
      <h1 className='text-h2 mb-4 font-bold text-textSecondary'>اشتراكاتي</h1>
      
      {/* 2. Short Circuit Rendering Conditions if Fetch Fails */}
      {fetchError ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 rounded-lg font-medium text-center my-6">
          حدث خطأ أثناء تحميل بيانات اشتراكاتك. يرجى تحديث الصفحة والمحاولة مرة أخرى.
        </div>
      ) : (
        <>
          {/* ---------- 1. USER'S CONTRACTS LIST ---------- */}
          <section className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {activeSubscriptions.length === 0 ? (
              <p className="text-textSecondary text-lead font-medium col-span-full">ليس لديك اشتراكات نشطة حالياً.</p>
            ) : (
              activeSubscriptions.map((sub) => (
                <SubscriptionCard 
                  key={sub.id} 
                  subscription={{
                    id: sub.id,
                    name: sub.planVariant.displayName,
                    startDate: sub.startDate,
                    endDate: sub.endDate,
                    invoiceStatus: sub.invoices[0]?.status || 'UNPAID',
                    amount: sub.invoices[0]?.amount || sub.planVariant.plan.monthlyPrice
                  }} 
                />
              ))
            )}
          </section>

          {/* ---------- 2. TRAINING TIMETABLE SCHEDULES ---------- */}
          <section className="my-8">
            <h2 className='text-lead md:text-h3 my-2 font-bold text-textSecondary'>مواعيد تمرين مجموعاتي</h2>
            {activeSubscriptions.length === 0 ? (
              <p className="text-textSecondary text-caption">اشترك في باقة لعرض مواعيد التدريب الخاصة بك هنا.</p>
            ) : (
              activeSubscriptions.map((sub) => {
                const schedules : GroupSchedule[] = sub.planVariant.schedules;
                return (
                  <div key={sub.id} className="mb-6 last:mb-0">
                    <h3 className='text-textPrimary text-lead font-bold mb-2'>{sub.planVariant.displayName}</h3>
                    {schedules.length === 0 ? (
                      <p className="text-textSecondary text-caption italic">لم يتم تحديد مواعيد أسبوعية لهذه المجموعة بعد.</p>
                    ) : (
                      <div className='flex flex-col sm:flex-row flex-wrap gap-4 text-lead [&>div]:font-bold [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&>div]:items-center [&>div]:py-3 [&>div]:px-4 [&>div]:shadow-basic [&>div]:rounded-lg'>
                        {schedules.map((slot, index) => {
                          const times = formatHourArabic(slot.startHour, slot.duration);
                          const isOdd = index % 2 !== 0;
                          return (
                            <div key={slot.id} className={isOdd ? 'bg-textPrimary text-surface' : 'bg-surface text-textPrimary dark:border dark:border-secondary'}>
                              {ARABIC_DAYS[slot.dayOfWeek] || 'يوم تدريب'}
                              <span className='flex items-center gap-2 font-medium text-sm sm:text-base'>
                                {times.start}
                                <CgArrowLeft className='text-secondary' />
                                {times.end}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </>
      )}

      {/* ---------- 3. AVAILABLE PURCHASING TIERS ---------- */}
      <section className='w-full mt-8'>
        <h2 className='text-lead md:text-h3 my-2 font-bold text-textSecondary'>الاشتراكات المتاحة للطلب</h2>
        <div className='flex gap-3 flex-col flex-wrap md:flex-row md:flex-wrap'>
          {formattedAvailablePlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </>
  );
}
