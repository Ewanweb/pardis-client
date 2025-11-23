import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './layouts/RequireAdmin';
import RequireRole from './layouts/RequireRole';
import Navbar from './components/NavBar';

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
            <Router>
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/" element={
                        <div className="min-h-screen font-sans bg-slate-50 text-slate-800" dir="rtl">
                            <Navbar />
                            <Home />
                            <footer className="bg-white border-t border-slate-100 py-12 mt-auto text-center text-slate-400 text-sm">© ۱۴۰۳ آکادمی پردیس</footer>
                        </div>
                    } />

                    <Route path="/login" element={<div className="font-sans" dir="rtl"><Navbar /><Login /></div>} />
                    <Route path="/register" element={<div className="font-sans" dir="rtl"><Navbar /><Register /></div>} />

                    {/* --- Admin Routes --- */}
                    {/* ✅ اصلاح نهایی: استفاده از * برای پشتیبانی از روت‌های تو در تو */}
                    <Route path="/admin/*" element={
                        <div className="font-sans" dir="rtl">
                            <RequireAdmin>
                                <AdminLayout>
                                    <Routes>
                                        {/* داشبورد اصلی */}
                                        <Route index element={<DashboardHome />} />

                                        {/* مدیریت دوره‌ها */}
                                        <Route path="courses" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor']}>
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
                                    </Routes>
                                </AdminLayout>
                            </RequireAdmin>
                        </div>
                    } />

                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;