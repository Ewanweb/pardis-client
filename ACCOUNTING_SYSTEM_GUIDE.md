# 💰 راهنمای سیستم حسابداری کامل

## خلاصه پیاده‌سازی

یک سیستم حسابداری و مالی کامل برای پنل ادمین پیاده‌سازی شده که شامل مدیریت پرداخت‌ها، گزارش‌گیری مالی و داشبورد تحلیلی است.

## 🏗️ ساختار سیستم

### 1. صفحات اصلی

#### 📊 داشبورد مالی (`/admin/accounting`)

- **فایل**: `src/pages/admin/Accounting.jsx`
- **ویژگی‌ها**:
  - کارت‌های آماری (کل درآمد، درآمد ماهانه، تراکنش‌ها، دانشجویان فعال)
  - نمودارهای تحلیلی (درآمد ماهانه، روش‌های پرداخت)
  - جدول تراکنش‌های اخیر با فیلتر و جستجو
  - مودال جزئیات تراکنش
  - دکمه export گزارش

#### 💳 مدیریت پرداخت‌ها (`/admin/payments`)

- **فایل**: `src/pages/admin/PaymentManagement.jsx`
- **ویژگی‌ها**:
  - مدیریت کامل تراکنش‌ها
  - فیلتر پیشرفته (وضعیت، روش پرداخت، تاریخ)
  - عملیات بازگشت وجه (Refund)
  - نمایش جزئیات کامل هر تراکنش
  - آمار نرخ موفقیت پرداخت‌ها

#### 📈 گزارش‌های مالی (`/admin/reports`)

- **فایل**: `src/pages/admin/FinancialReports.jsx`
- **ویژگی‌ها**:
  - تولید گزارش‌های تخصصی (درآمد، دانشجویان، دوره‌ها، پرداخت‌ها)
  - نمودارهای تحلیلی
  - دانلود گزارش‌ها در فرمت‌های مختلف
  - فیلتر بازه زمانی
  - گزارش جامع

### 2. کامپوننت‌های مشترک

#### StatCard

```jsx
<StatCard
  title="کل درآمد"
  value={formatPrice(125000000) + " تومان"}
  change={12.5}
  changeType="increase"
  icon={DollarSign}
  color="emerald"
/>
```

#### PaymentStatusBadge

```jsx
<PaymentStatusBadge status="completed" />
// نمایش: "تکمیل شده" با رنگ سبز
```

#### PaymentMethodBadge

```jsx
<PaymentMethodBadge method="online" gateway="zarinpal" />
// نمایش: "آنلاین (zarinpal)"
```

## 🎨 طراحی UI/UX

### رنگ‌بندی

- **سبز (Emerald)**: درآمد و تراکنش‌های موفق
- **آبی (Indigo/Blue)**: اطلاعات عمومی و کارت‌ها
- **زرد (Amber)**: تراکنش‌های در انتظار
- **قرمز (Red)**: تراکنش‌های ناموفق و هشدارها
- **بنفش (Purple)**: آمار و نمودارها

### انیمیشن‌ها

- **Fade-in**: ورود صفحات
- **Slide-in**: ورود کارت‌ها
- **Hover Effects**: تغییر رنگ و سایه
- **Loading Spinners**: حین بارگذاری داده‌ها

### Responsive Design

- **Mobile First**: طراحی ابتدا برای موبایل
- **Grid System**: استفاده از CSS Grid
- **Flexible Cards**: کارت‌های قابل انطباق
- **Overflow Handling**: مدیریت محتوای اضافی

## 🔐 کنترل دسترسی

### نقش‌های مجاز

```javascript
allowedRoles: ["Admin", "Manager", "GeneralManager", "FinancialManager"];
```

### سطوح دسترسی

- **Admin**: دسترسی کامل به همه بخش‌ها
- **Manager**: مدیریت پرداخت‌ها و گزارش‌ها
- **GeneralManager**: نظارت بر کل سیستم مالی
- **FinancialManager**: تخصص در امور مالی

## 📊 داده‌های Mock

### آمار مالی

```javascript
const mockStats = {
  totalRevenue: 125000000, // کل درآمد
  monthlyRevenue: 15000000, // درآمد ماهانه
  totalTransactions: 342, // کل تراکنش‌ها
  activeStudents: 156, // دانشجویان فعال
  revenueChange: 12.5, // تغییر درآمد (درصد)
  transactionChange: 8.3, // تغییر تراکنش‌ها
  studentChange: -2.1, // تغییر دانشجویان
};
```

### نمونه تراکنش

```javascript
const mockTransaction = {
  id: "TXN-001",
  studentName: "علی احمدی",
  courseName: "دوره React.js پیشرفته",
  amount: 2500000,
  status: "completed", // completed, pending, failed, refunded
  method: "online", // online, wallet
  gateway: "zarinpal", // zarinpal, mellat, etc.
  createdAt: "2024-12-14T10:30:00Z",
};
```

## 🛠️ ویژگی‌های فنی

### فیلترینگ و جستجو

```javascript
// فیلتر بر اساس وضعیت
const filteredByStatus = transactions.filter((t) => t.status === "completed");

// جستجو در نام دانشجو و دوره
const searchResults = transactions.filter(
  (t) =>
    t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.courseName.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Export گزارش‌ها

```javascript
const exportToCSV = (data) => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "شناسه,نام دانشجو,نام دوره,مبلغ,وضعیت,تاریخ\n" +
    data.map((row) => Object.values(row).join(",")).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "financial_report.csv");
  link.click();
};
```

### مدیریت خطا

```javascript
// استفاده از سیستم خطای موجود
const { handleError, clearError } = useErrorHandler();

try {
  const response = await api.get("/admin/accounting/stats");
  setStats(response.data);
} catch (error) {
  setApiError(error);
  handleError(error, false);
}
```

## 🔄 API Endpoints (پیشنهادی)

### آمار مالی

```
GET /admin/accounting/stats
Response: {
    totalRevenue: number,
    monthlyRevenue: number,
    totalTransactions: number,
    activeStudents: number,
    trends: { ... }
}
```

### لیست تراکنش‌ها

```
GET /admin/accounting/transactions?status=completed&method=online&page=1
Response: {
    data: Transaction[],
    pagination: { ... }
}
```

### جزئیات تراکنش

```
GET /admin/accounting/transactions/:id
Response: Transaction
```

### بازگشت وجه

```
POST /admin/accounting/transactions/:id/refund
Body: { reason: string }
Response: { success: boolean, message: string }
```

### تولید گزارش

```
POST /admin/reports/generate
Body: {
    type: 'revenue' | 'students' | 'courses' | 'payments',
    dateRange: 'week' | 'month' | 'quarter' | 'year',
    format: 'pdf' | 'excel' | 'csv'
}
Response: { downloadUrl: string }
```

## 📱 نمایش در موبایل

### جدول‌های Responsive

- **Horizontal Scroll**: برای جدول‌های پیچیده
- **Card Layout**: تبدیل ردیف‌ها به کارت در موبایل
- **Collapsible Sections**: بخش‌های قابل جمع‌شدن

### مودال‌های موبایل

- **Full Screen**: در اندازه‌های کوچک
- **Bottom Sheet**: برای عملیات سریع
- **Swipe Gestures**: برای بستن مودال‌ها

## 🚀 ویژگی‌های پیشرفته

### Real-time Updates

```javascript
// WebSocket برای به‌روزرسانی لحظه‌ای
useEffect(() => {
  const ws = new WebSocket("ws://localhost:8080/admin/accounting");
  ws.onmessage = (event) => {
    const newTransaction = JSON.parse(event.data);
    setTransactions((prev) => [newTransaction, ...prev]);
  };
  return () => ws.close();
}, []);
```

### Caching

```javascript
// Cache کردن داده‌ها برای بهبود عملکرد
const [cachedStats, setCachedStats] = useState(() => {
  const cached = localStorage.getItem("accounting_stats");
  return cached ? JSON.parse(cached) : null;
});
```

### Pagination

```javascript
// صفحه‌بندی برای لیست‌های بزرگ
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(20);
const totalPages = Math.ceil(totalItems / itemsPerPage);
```

## 🎯 نتیجه‌گیری

سیستم حسابداری کامل پیاده‌سازی شده که شامل:

✅ **داشبورد مالی جامع** با آمار و نمودارهای تحلیلی

✅ **مدیریت پرداخت‌ها** با قابلیت بازگشت وجه

✅ **گزارش‌گیری پیشرفته** با امکان دانلود

✅ **طراحی زیبا و کاربرپسند** با پشتیبانی از حالت تاریک

✅ **Responsive Design** برای همه دستگاه‌ها

✅ **کنترل دسترسی** بر اساس نقش کاربر

✅ **مدیریت خطای جامع** با نمایش پیام‌های مناسب

✅ **Mock Data** برای تست و نمایش

این سیستم آماده اتصال به بکند واقعی است و تمام ویژگی‌های لازم برای مدیریت مالی یک سیستم آموزشی را فراهم می‌کند.
