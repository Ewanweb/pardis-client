import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './layouts/RequireAdmin';
import RequireRole from './layouts/RequireRole';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import DashboardHome from './pages/admin/DashboardHome';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import CourseSchedules from './pages/admin/CourseSchedules';
import CategoryPage from "./pages/CategoryPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Checkout from "./pages/Chekout.jsx";

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        {/* --- Public Routes --- */}
                        <Route path="/" element={
                            <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <Home />
                                <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                    © ۱۴۰۳ آکادمی پردیس - توسعه با ❤️
                                </footer>
                            </div>
                        } />
                        <Route path="/category/:slug" element={
                            <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <CategoryPage />
                                <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                    © ۱۴۰۳ آکادمی پردیس
                                </footer>
                            </div>
                        } />
                        <Route path="/course/:slug" element={
                            <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <CourseDetail />
                                <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                    © ۱۴۰۳ آکادمی پردیس
                                </footer>
                            </div>
                        } />
                        <Route path="/checkout/:slug" element={
                            <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <Checkout />
                            </div>
                        } />
                        <Route path="/profile" element={
                            <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <UserProfile />
                            </div>
                        } />

                        <Route path="/login" element={<div className="font-sans bg-white dark:bg-slate-950 min-h-screen" dir="rtl"><Navbar /><Login /></div>} />
                        <Route path="/register" element={<div className="font-sans bg-white dark:bg-slate-950 min-h-screen" dir="rtl"><Navbar /><Register /></div>} />

                        {/* --- Admin Routes --- */}
                        <Route path="/admin/*" element={
                            <div className="font-sans" dir="rtl">
                                <RequireAdmin>
                                    <AdminLayout>
                                        <Routes>
                                            {/* داشبورد */}
                                            <Route index element={<DashboardHome />} />

                                            {/* ۱. مدیریت کل دوره‌ها (برای مدیران) */}
                                            <Route path="courses" element={
                                                <RequireRole allowedRoles={['Admin', 'Manager', 'EducationManager']}>
                                                    <AdminCourses />
                                                </RequireRole>
                                            } />

                                            {/* ✅ ۲. دوره‌های من (برای مدرسین) */}
                                            <Route path="my-courses" element={
                                                <RequireRole allowedRoles={['Instructor', 'Admin', 'Manager']}>
                                                    <AdminCourses />
                                                </RequireRole>
                                            } />

                                            {/* مدیریت دسته‌بندی‌ها */}
                                            <Route path="categories" element={
                                                <RequireRole allowedRoles={['Admin', 'Manager']}>
                                                    <AdminCategories />
                                                </RequireRole>
                                            } />

                                            {/* مدیریت کاربران */}
                                            <Route path="users" element={
                                                <RequireRole allowedRoles={['Manager']}>
                                                    <AdminUsers />
                                                </RequireRole>
                                            } />

                                            {/* مدیریت زمان‌بندی دوره */}
                                            <Route path="courses/:courseId/schedules" element={
                                                <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor']}>
                                                    <CourseSchedules />
                                                </RequireRole>
                                            } />
                                        </Routes>
                                    </AdminLayout>
                                </RequireAdmin>
                            </div>
                        } />

                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;