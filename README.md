# 🏓 Table Tennis Training Center Management System
### نظام إدارة مركز تدريب تنس الطاولة

A comprehensive, robust, and modern workspace platform engineered to streamline the operations of a professional Table Tennis Training Center. This application provides a dual-sided experience, offering a smooth interface for players to manage their activities and a powerful command center for managers to oversee the venue, finance, and training cohorts.

منصة برمجية متكاملة وحديثة مصممة لتسهيل وإدارة عمليات مركز تدريب تنس طاولة احترافي. يقدم التطبيق تجربة ثنائية الأبعاد: واجهة سلسة للاعبين لإدارة أنشطتهم، ولوحة تحكم قوية للمديرين لمراقبة الصالة، الشؤون المالية، ومجموعات التدريب.

---

## 👥 Dual-Sided Application Architecture / بنية التطبيق ثنائية الأبعاد

### 🏃‍♂️ 1. Player Side Capabilities / مميزات جانب اللاعب
Designed for mobile-first responsiveness, the player's portal keeps members connected to the club's resources at all times:
تم تصميمه ليتوافق بشكل ممتاز مع الهواتف المحمولة، مما يبقي اللاعبين على اتصال دائم بموارد النادي:

*   **Reservation Wizard:** View a real-time calendar grid and add new private table bookings based on active venue availability.
    *   **عرض وحجز الطاولات:** عرض جدول زمني فوري وحجز طاولات لعب خاصة بناءً على الساعات المتاحة في الصالة.
*   **Invoices & Debt Ticker:** Instantly track individual transaction histories, view invoice statuses, and monitor outstanding debts against the center's maximum credit threshold.
    *   **الفواتير ومؤشر الذمم المالية:** تتبع فوري لتاريخ المعاملات المالي، وعرض حالة الفواتير، ومراقبة الديون المعلقة مقارنة بسقف الدين المسموح به في المركز.
*   **Subscriptions & Master Schedules:** View active contract details and access localized Arabic weekly training schedules for designated group training sessions.
    *   **الاشتراكات وجداول المجموعات:** عرض تفاصيل الباقات النشطة والوصول إلى جداول التدريب الأسبوعية المخصصة لمجموعاتهم التدريبية باللغة العربية.

---

### 👑 2. Manager Side Command Center / لوحة تحكم الإدارة
A comprehensive dashboard providing complete control over the facility, pricing metrics, and personnel tracking:
لوحة تحكم شاملة توفر تحكماً كاملاً بالمنشأة، معايير التسعير، ومتابعة الموظفين واللاعبين:

*   **Visual Schedule Calendar:** Track private table allocations and collective group training schedules via a highly responsive grid timeline canvas.
    *   **تقويم الحجوزات البصري:** تتبع توزيع الطاولات الخاصة ومواعيد تدريب المجموعات عبر مخطط شبكي زمني مرن وسلس.
*   **Financial Receipts Ledger:** Review monthly financial performance metrics (Total Earnings, PAID vs. UNPAID stats) and instantly process manual payments.
    *   **دفتر الحسابات والفواتير:** مراجعة مؤشرات الأداء المالي الشهري (إجمالي الإيرادات، إحصائيات الفواتير المدفوعة وغير المدفوعة) وتأكيد استلام الدفعات نقداً كاش بضغطة زر.
*   **Smart Walk-In Invoicing:** Issue standalone custom bills unattached to code bookings. Integrates with a user autocomplete search endpoint; if the user doesn't exist, an automated Option A "Ghost Profile" engine creates a clean walk-in profile on the fly to accurately log names and credit balances.
    *   **الفواتير الذكية للزبائن العابرين:** إصدار فواتير يدوية مخصصة غير مرتبطة بحجز مسبق. يتكامل النظام مع ميزة الإكمال التلقائي للبحث عن اللاعبين؛ وإذا لم يكن الاسم مسجلاً، يقوم محرك تلقائي بإنشاء ملف تعريف "زبون عابر" فوراً لحفظ الاسم والذمم المالية بدقة دون تكرار.
*   **Subscription & Program Architect:** Add, edit, or delete tiered subscription packages and configure specific recurring team training timetables.
    *   **إدارة خطط الاشتراكات:** إضافة، تعديل، أو حذف باقات العضوية، وتكوين مواعيد تدريبية أسبوعية متكررة للمجموعات المشتركة.
*   **Age Groups Configuration:** Dynamically configure operational age brackets (e.g., U13, U16, Adults) to segment training cohorts and target subscription structures safely.
    *   **إعداد الفئات العمرية:** تهيئة مرنة للشرايح العمرية (مثل: أشبال تحت 13 سنة، ناشئين، كبار) لتصنيف المجموعات وتوجيه باقات العضوية المناسبة.
*   **Player Account Directory:** Explore a robust user database, view individual invoice/booking logs, modify secret login credentials (email/password/DoB), or perform a cascading secure purge removal of a user.
    *   **دليل حسابات اللاعبين:** استعراض قاعدة بيانات اللاعبين، عرض سجلات فواتيرهم وحجوزاتهم بالتفصيل، تعديل البيانات السرية (البريد، كلمة المرور، تاريخ الميلاد)، أو حذف الحساب نهائياً مع تنظيف سجلاته المترابطة بأمان.
*   **Venue Controls & Admin Safeguards:** Edit global values (hourly table/coach rates, flat paddle fees, cancellation lockout windows, total active tables count) and restrict staff elevation adjustments exclusively to a single master Super-Admin email.
    *   **إعدادات الصالة وصلاحيات المشرفين:** تعديل المعايير العامة (سعر الطاولة/المدرب بالساعة، رسوم المضارب، مهلة إلغاء الحجز، إجمالي عدد الطاولات)، وحصر صلاحية ترقية أو سحب رتب المشرفين بحساب المالك الرئيسي (Super-Admin) فقط.

---

## 🛠️ Technology Stack / التقنيات المستخدمة

*   **Framework:** Next.js (App Router, Server Actions, Client/Server Components Architecture)
*   **Database ORM:** Prisma ORM with native indexing for lightning-fast lookups
*   **Database Server:** PostgreSQL Relational Database Cluster
*   **Styling Engine:** Tailwind CSS with fluid multi-theme typography layout support
*   **Security & Authentication:** NextAuth.js with bcrypt session encryption handles

---

## ⚙️ Initial Setup & Installation / التنصيب والتشغيل المبدئي

1.  **Clone the repository / استنساخ المشروع:**
    ```bash
    git clone https://github.com
    cd table-tennis-training-center-management
    ```

2.  **Install dependencies / تثبيت الحزم البرمجية:**
    ```bash
    npm install
    ```

3.  **Configure environment variables / إعداد ملف البيئة:**
    Copy `.env.example` into a new file named `.env` and fill out your PostgreSQL database string connections and Next-Auth secret pins.
    قم بنسخ ملف `.env.example` إلى ملف جديد باسم `.env` واملأ بيانات الاتصال بقاعدة البيانات ومفاتيح الحماية الخاصة بالتسجيل.

4.  **Sync database schema / مزامنة قاعدة البيانات:**
    ```bash
    npx prisma db push
    ```

5.  **Initialize global settings / تشغيل تهيئة الإعدادات:**
    Ensure you seed your database with the primary `global-config` record so the player-end select models and table counts fetch smoothly on launch.
    تأكد من إدراج سجل التهيئة المبدئي لـ `global-config` لضمان عمل حسابات الطاولات والأسعار بشكل سليم عند أول تشغيل.

6.  **Run development server / تشغيل سيرفر التطوير:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` inside your browser view to view your responsive table tennis application!

---

## 🔒 Security Best Practices & Transactions / معايير الحماية ومعالجة البيانات
*   **Cascading Purge Safety Guards:** Deletions of core system resources or users are protected via custom `prisma.$transaction` loops, ensuring that if any single process breaks, the database rolls back atomically to prevent orphaned rows.
*   **Debt Ceiling Limit Enforcements:** A centralized server-side financial gatekeeper intercepts user reservation requests to prevent bookings if an account carries unpaid invoices that cross your configured max debt threshold.
*   **Cancellation Lockout Window:** Reservation cancellations evaluate real-time temporal differences against the center's custom cancellation window variable, automatically locking out last-minute changes.

*   **حماية البيانات بنظام التعاقب:** عمليات حذف الحسابات محمية عبر كتل `prisma.$transaction` التبادلية، لضمان تراجع النظام بالكامل في حال حدوث خلل، منعاً لتراكم البيانات اليتيمة أو المعطوبة.
*   **بوابة سقف الديون المعلقة:** يقوم النظام بفحص فوري لذمم اللاعب المالية قبل اعتماد أي حجز خاص لمنع استغلال الموارد في حال تجاوز العميل حد المديونية المسموح به.
*   **مهلة الإلغاء المقفلة:** يتم احتساب الفارق الزمني للحجوزات برمجياً ومقارنته بالمهلة المحددة في الإعدادات، مما يمنع اللاعبين من إلغاء الحجز في الأوقات الحرجة لضمان استمرارية تشغيل الطاولات.
