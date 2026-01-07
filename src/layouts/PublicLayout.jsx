import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageSkeleton from '../components/PageSkeleton';

const PublicLayout = () => {
    return (
        <div className="min-h-screen font-sans bg-white dark:bg-slate-950 text-text-primary dark:text-slate-100 transition-colors duration-300" dir="rtl">
            <Navbar />
            <main role="main" aria-label="محتوای اصلی">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;