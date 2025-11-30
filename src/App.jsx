import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// ✅ ایمپورت ThemeProvider برای مدیریت دارک مود
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

function App() {
    return (
        <AuthProvider>
            {/* ✅ اضافه کردن ThemeProvider دورِ Router تا همه جا به تم دسترسی داشته باشند */}
            <ThemeProvider>
                <Router>
                    <Routes>
                        {/* --- Public Routes (بخش عمومی سایت) --- */}
                        <Route path="/" element={
                            <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <Home />
                                <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 mt-auto text-center text-slate-400 text-sm">
                                    © ۱۴۰۳ آکادمی پردیس - توسعه با ❤️
                                </footer>
                            </div>
                        } />

                        <Route path="/login" element={
                            <div className="font-sans bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <Login />
                            </div>
                        } />

                        <Route path="/register" element={
                            <div className="font-sans bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300" dir="rtl">
                                <Navbar />
                                <Register />
                            </div>
                        } />

                        {/* --- Admin Routes (بخش مدیریت) --- */}
                        <Route path="/admin/*" element={
                            <div className="font-sans" dir="rtl">
                                <RequireAdmin>
                                    <AdminLayout>
                                        <Routes>
                                            {/* داشبورد اصلی */}
                                            <Route index element={<DashboardHome />} />

                                            {/* مدیریت دوره‌ها (ادمین، مدیر، مدرس) */}
                                            <Route path="courses" element={
                                                <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor']}>
                                                    <AdminCourses />
                                                </RequireRole>
                                            } />

                                            {/* مدیریت دسته‌بندی‌ها (ادمین، مدیر) */}
                                            <Route path="categories" element={
                                                <RequireRole allowedRoles={['Admin', 'Manager']}>
                                                    <AdminCategories />
                                                </RequireRole>
                                            } />

                                            {/* مدیریت کاربران (فقط مدیر) */}
                                            <Route path="users" element={
                                                <RequireRole allowedRoles={['Manager']}>
                                                    <AdminUsers />
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