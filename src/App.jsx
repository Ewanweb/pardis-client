import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './layouts/RequireAdmin';
import GuestOnly from './layouts/GuestOnly';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/PageSkeleton';

// ✅ FSD ARCHITECTURE: Route-level code splitting with proper feature organization
// Public pages
const HomePage = React.lazy(() => import('./pages/Home'));
const LoginPage = React.lazy(() => import('./pages/auth/Login'));
const RegisterPage = React.lazy(() => import('./pages/auth/Register'));
const ProfilePage = React.lazy(() => import('./pages/UserProfile'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetail'));
const CheckoutPage = React.lazy(() => import('./pages/Chekout'));
const ManualPaymentPage = React.lazy(() => import('./pages/ManualPayment'));
const CartPage = React.lazy(() => import('./pages/Cart'));
const MyOrdersPage = React.lazy(() => import('./pages/MyOrders'));
const NotFoundPage = React.lazy(() => import('./pages/NotFound'));
const BlogIndexPage = React.lazy(() => import('./pages/blog/BlogIndex'));
const BlogPostPage = React.lazy(() => import('./pages/blog/BlogPost'));
const BlogCategoryPage = React.lazy(() => import('./pages/blog/BlogCategory'));
const BlogTagPage = React.lazy(() => import('./pages/blog/BlogTag'));
const BlogSearchPage = React.lazy(() => import('./pages/blog/BlogSearch'));

// Admin pages - loaded only when needed
const AdminDashboardPage = React.lazy(() => import('./pages/admin/DashboardHome'));
const AdminCoursesPage = React.lazy(() => import('./pages/admin/AdminCourses'));
const AdminCategoriesPage = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminPaymentsPage = React.lazy(() => import('./pages/admin/PaymentManagement'));
const AdminSlidesPage = React.lazy(() => import('./pages/admin/SlidesManagement'));
const AdminStoriesPage = React.lazy(() => import('./pages/admin/StoriesManagement'));
const AdminSystemSettingsPage = React.lazy(() => import('./pages/admin/SystemSettings'));
const AdminSystemLogsPage = React.lazy(() => import('./pages/admin/SystemLogs'));
const AdminBlogPage = React.lazy(() => import('./pages/admin/AdminBlog'));
const BlogCategoriesPage = React.lazy(() => import('./pages/admin/blog/BlogCategories'));
const BlogCategoryFormPage = React.lazy(() => import('./pages/admin/blog/BlogCategoryForm'));
const BlogTagsPage = React.lazy(() => import('./pages/admin/blog/BlogTags'));
const BlogTagFormPage = React.lazy(() => import('./pages/admin/blog/BlogTagForm'));
const BlogPostFormPage = React.lazy(() => import('./pages/admin/blog/BlogPostForm'));
const LMSManagementPage = React.lazy(() => import('./pages/admin/LMSManagement'));
const AdminConsultationsPage = React.lazy(() => import('./features/admin/consultations/pages/AdminConsultationsPage'));

// Student pages
const StudentDashboardPage = React.lazy(() => import('./pages/student/StudentDashboard'));

function App() {
    // Initialize optimizations
    useEffect(() => {
        // Performance optimizations
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Preload critical resources
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = '/api/user';
                document.head.appendChild(link);
            });
        }

        // Mobile optimizations
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        console.log("🚀 Pardis Academy - FSD Architecture Initialized");
    }, []);

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <Router
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<PublicLayout />}>
                                <Route index element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <HomePage />
                                    </Suspense>
                                } />

                                <Route path="category/:slug" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <CategoryPage />
                                    </Suspense>
                                } />

                                <Route path="course/:slug" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <CourseDetailPage />
                                    </Suspense>
                                } />

                                <Route path="checkout/:slug" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <CheckoutPage />
                                    </Suspense>
                                } />

                                <Route path="cart" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <CartPage />
                                    </Suspense>
                                } />

                                <Route path="profile" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <ProfilePage />
                                    </Suspense>
                                } />

                                <Route path="me/orders" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <MyOrdersPage />
                                    </Suspense>
                                } />

                                <Route path="blog" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogIndexPage />
                                    </Suspense>
                                } />

                                <Route path="blog/search" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogSearchPage />
                                    </Suspense>
                                } />

                                <Route path="blog/category/:slug" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogCategoryPage />
                                    </Suspense>
                                } />

                                <Route path="blog/tag/:slug" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogTagPage />
                                    </Suspense>
                                } />

                                <Route path="blog/:slug" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogPostPage />
                                    </Suspense>
                                } />

                                <Route path="payment/manual/:paymentId" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <ManualPaymentPage />
                                    </Suspense>
                                } />
                            </Route>

                            <Route path="/login" element={
                                <GuestOnly>
                                    <Suspense fallback={<PageSkeleton />}>
                                        <LoginPage />
                                    </Suspense>
                                </GuestOnly>
                            } />

                            <Route path="/register" element={
                                <GuestOnly>
                                    <Suspense fallback={<PageSkeleton />}>
                                        <RegisterPage />
                                    </Suspense>
                                </GuestOnly>
                            } />

                            <Route path="/admin" element={
                                <RequireAdmin>
                                    <AdminLayout />
                                </RequireAdmin>
                            }>
                                <Route index element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminDashboardPage />
                                    </Suspense>
                                } />

                                <Route path="blog" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminBlogPage />
                                    </Suspense>
                                } />

                                <Route path="blog/create" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogPostFormPage />
                                    </Suspense>
                                } />

                                <Route path="blog/edit/:id" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogPostFormPage />
                                    </Suspense>
                                } />

                                <Route path="blog/categories" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogCategoriesPage />
                                    </Suspense>
                                } />

                                <Route path="blog/categories/create" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogCategoryFormPage />
                                    </Suspense>
                                } />

                                <Route path="blog/categories/edit/:id" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogCategoryFormPage />
                                    </Suspense>
                                } />

                                <Route path="blog/tags" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogTagsPage />
                                    </Suspense>
                                } />

                                <Route path="blog/tags/create" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogTagFormPage />
                                    </Suspense>
                                } />

                                <Route path="blog/tags/edit/:id" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <BlogTagFormPage />
                                    </Suspense>
                                } />

                                <Route path="courses" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminCoursesPage />
                                    </Suspense>
                                } />

                                <Route path="courses/:courseId/lms" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <LMSManagementPage />
                                    </Suspense>
                                } />

                                <Route path="categories" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminCategoriesPage />
                                    </Suspense>
                                } />

                                <Route path="users" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminUsersPage />
                                    </Suspense>
                                } />

                                <Route path="payments" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminPaymentsPage />
                                    </Suspense>
                                } />

                                <Route path="consultations" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminConsultationsPage />
                                    </Suspense>
                                } />

                                <Route path="slides" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminSlidesPage />
                                    </Suspense>
                                } />

                                <Route path="stories" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminStoriesPage />
                                    </Suspense>
                                } />

                                <Route path="system" element={
                                    <Navigate to="/admin/system-settings" replace />
                                } />

                                <Route path="system-settings" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminSystemSettingsPage />
                                    </Suspense>
                                } />

                                <Route path="system-logs" element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <AdminSystemLogsPage />
                                    </Suspense>
                                } />
                            </Route>

                            {/* ✅ STUDENT ROUTES */}
                            <Route path="/student" element={
                                <Suspense fallback={<PageSkeleton />}>
                                    <StudentDashboardPage />
                                </Suspense>
                            } />

                            {/* ✅ 404 ROUTE */}
                            <Route path="*" element={
                                <Suspense fallback={<PageSkeleton />}>
                                    <NotFoundPage />
                                </Suspense>
                            } />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
