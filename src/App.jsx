import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppBootstrapProvider } from './context/AppBootstrapContext';
import { initMobileOptimizations } from './utils/mobileOptimizations';
import { initPerformanceOptimizations } from './utils/performanceOptimizations';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './layouts/RequireAdmin';
import RequireRole from './layouts/RequireRole';
import GuestOnly from './layouts/GuestOnly';
import Navbar from './components/Navbar';
import SuspenseWrapper from './components/SuspenseWrapper';
import AlertContainer from './components/AlertContainer';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ErrorTestPage = React.lazy(() => import('./pages/ErrorTestPage'));

// Lazy load admin pages for better performance
const DashboardHome = React.lazy(() => import('./pages/admin/DashboardHome'));
const AdminCourses = React.lazy(() => import('./pages/admin/AdminCourses'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const CourseSchedules = React.lazy(() => import('./pages/admin/CourseSchedules'));
const LMSManagement = React.lazy(() => import('./pages/admin/LMSManagement'));
const Accounting = React.lazy(() => import('./pages/admin/Accounting'));
const PaymentManagement = React.lazy(() => import('./pages/admin/PaymentManagement'));
const FinancialReports = React.lazy(() => import('./pages/admin/FinancialReports'));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage.jsx"));
const UserProfile = React.lazy(() => import("./pages/UserProfile.jsx"));
const CourseDetail = React.lazy(() => import("./pages/CourseDetail.jsx"));
const Checkout = React.lazy(() => import("./pages/Chekout.jsx"));
const PaymentCallback = React.lazy(() => import("./pages/PaymentCallback.jsx"));

function App() {
    // اجرای بهینه‌سازی‌های موبایل
    React.useEffect(() => {
        initMobileOptimizations();
        initPerformanceOptimizations();
    }, []);

    return (
        <AuthProvider>
            <ThemeProvider>
                <AppBootstrapProvider>
                    <Router
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true
                        }}
                    >
                        <AlertContainer />
                        <Routes>
                            {/* --- Public Routes --- */}
                            <Route path="/" element={
                                <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                    <Navbar />
                                    <main role="main" aria-label="محتوای اصلی">
                                        <SuspenseWrapper>
                                            <Home />
                                        </SuspenseWrapper>
                                    </main>
                                    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                        © ۱۴۰۳ آکادمی پردیس توس - توسعه با ❤️
                                    </footer>
                                </div>
                            } />
                            <Route path="/category/:slug" element={
                                <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                    <Navbar />
                                    <SuspenseWrapper>
                                        <CategoryPage />
                                    </SuspenseWrapper>
                                    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                        © ۱۴۰۳ آکادمی پردیس توس
                                    </footer>
                                </div>
                            } />
                            <Route path="/course/:slug" element={
                                <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                    <Navbar />
                                    <SuspenseWrapper>
                                        <CourseDetail />
                                    </SuspenseWrapper>
                                    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                        © ۱۴۰۳ آکادمی پردیس توس
                                    </footer>
                                </div>
                            } />
                            <Route path="/checkout/:slug" element={
                                <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                    <Navbar />
                                    <SuspenseWrapper>
                                        <Checkout />
                                    </SuspenseWrapper>
                                </div>
                            } />
                            <Route path="/profile" element={
                                <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                    <Navbar />
                                    <SuspenseWrapper>
                                        <UserProfile />
                                    </SuspenseWrapper>
                                </div>
                            } />
                            <Route path="/payment/callback" element={
                                <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                    <Navbar />
                                    <SuspenseWrapper>
                                        <PaymentCallback />
                                    </SuspenseWrapper>
                                </div>
                            } />

                            {/* صفحه تست خطاها (فقط در حالت development) */}
                            {import.meta.env.DEV && (
                                <Route path="/error-test" element={
                                    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                        <Navbar />
                                        <SuspenseWrapper>
                                            <ErrorTestPage />
                                        </SuspenseWrapper>
                                    </div>
                                } />
                            )}

                            <Route path="/login" element={
                                <GuestOnly>
                                    <div className="font-sans bg-white dark:bg-slate-950 min-h-screen" dir="rtl">
                                        <Navbar />
                                        <SuspenseWrapper>
                                            <Login />
                                        </SuspenseWrapper>
                                    </div>
                                </GuestOnly>
                            } />
                            <Route path="/register" element={
                                <GuestOnly>
                                    <div className="font-sans bg-white dark:bg-slate-950 min-h-screen" dir="rtl">
                                        <Navbar />
                                        <SuspenseWrapper>
                                            <Register />
                                        </SuspenseWrapper>
                                    </div>
                                </GuestOnly>
                            } />

                            {/* --- Admin Routes --- */}
                            <Route path="/admin/*" element={
                                <div className="font-sans" dir="rtl">
                                    <RequireAdmin>
                                        <AdminLayout>
                                            <Routes>
                                                {/* داشبورد */}
                                                <Route index element={
                                                    <SuspenseWrapper>
                                                        <DashboardHome />
                                                    </SuspenseWrapper>
                                                } />

                                                {/* ۱. مدیریت کل دوره‌ها (برای مدیران آموزشی و بالاتر) */}
                                                <Route path="courses" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'EducationManager', 'GeneralManager', 'DepartmentManager']}>
                                                        <SuspenseWrapper>
                                                            <AdminCourses />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                {/* ✅ ۲. دوره‌های من (برای مدرسین و کارشناسان آموزش) */}
                                                <Route path="my-courses" element={
                                                    <RequireRole allowedRoles={['Instructor', 'EducationExpert', 'CourseSupport', 'Admin', 'Manager']}>
                                                        <SuspenseWrapper>
                                                            <AdminCourses />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                {/* مدیریت دسته‌بندی‌ها (مخصوص مدیران سیستم و آموزش) */}
                                                <Route path="categories" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'EducationManager', 'GeneralManager']}>
                                                        <SuspenseWrapper>
                                                            <AdminCategories />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                {/* مدیریت کاربران (مخصوص مدیران ارشد) */}
                                                <Route path="users" element={
                                                    <RequireRole allowedRoles={['Manager', 'GeneralManager', 'ITManager', 'DepartmentManager']}>
                                                        <SuspenseWrapper>
                                                            <AdminUsers />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                {/* مدیریت زمان‌بندی دوره (برای مدرسین و مدیران آموزشی) */}
                                                <Route path="courses/:courseId/schedules" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor', 'EducationManager', 'EducationExpert', 'CourseSupport']}>
                                                        <SuspenseWrapper>
                                                            <CourseSchedules />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                {/* مدیریت LMS دوره (برای مدرسین و مدیران آموزشی) */}
                                                <Route path="courses/:courseId/lms" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor', 'EducationManager', 'EducationExpert', 'CourseSupport']}>
                                                        <SuspenseWrapper>
                                                            <LMSManagement />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                {/* بخش حسابداری و مالی (مخصوص نقش‌های مالی) */}
                                                <Route path="accounting" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']}>
                                                        <SuspenseWrapper>
                                                            <Accounting />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                <Route path="payments" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']}>
                                                        <SuspenseWrapper>
                                                            <PaymentManagement />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />

                                                <Route path="reports" element={
                                                    <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']}>
                                                        <SuspenseWrapper>
                                                            <FinancialReports />
                                                        </SuspenseWrapper>
                                                    </RequireRole>
                                                } />
                                            </Routes>
                                        </AdminLayout>
                                    </RequireAdmin>
                                </div>
                            } />

                        </Routes>
                    </Router>
                </AppBootstrapProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
