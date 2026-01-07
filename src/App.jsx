import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppBootstrapProvider } from './context/AppBootstrapContext';
import { initMobileOptimizations } from './utils/mobileOptimizations';
import { initPerformanceOptimizations } from './utils/performanceOptimizations';
import { initExpirationCleanup } from './utils/storyExpiration';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './layouts/RequireAdmin';
import RequireRole from './layouts/RequireRole';
import GuestOnly from './layouts/GuestOnly';
import AlertContainer from './components/AlertContainer';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/PageSkeleton';

// ✅ OPTIMIZATION: Route-level code splitting - each route loads independently
// Public pages
const Home = React.lazy(() => import('./pages/HomeOptimized'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const Checkout = React.lazy(() => import('./pages/Chekout'));
const ManualPayment = React.lazy(() => import('./pages/ManualPayment'));
const Cart = React.lazy(() => import('./pages/Cart'));
const CheckoutCart = React.lazy(() => import('./pages/CheckoutCart'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Admin pages - loaded only when needed
const DashboardHome = React.lazy(() => import('./pages/admin/DashboardHome'));
const AdminCourses = React.lazy(() => import('./pages/admin/AdminCourses'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const MyStudents = React.lazy(() => import('./pages/admin/MyStudents'));
const CourseSchedules = React.lazy(() => import('./pages/admin/CourseSchedules'));
const LMSManagement = React.lazy(() => import('./pages/admin/LMSManagement'));
const Accounting = React.lazy(() => import('./pages/admin/Accounting'));
const PaymentManagement = React.lazy(() => import('./pages/admin/PaymentManagement'));
const FinancialReports = React.lazy(() => import('./pages/admin/FinancialReports'));
const SlidesManagement = React.lazy(() => import('./pages/admin/SlidesManagement'));
const SwaggerPage = React.lazy(() => import('./pages/admin/Swagger'));
const StoriesManagement = React.lazy(() => import('./pages/admin/StoriesManagement'));
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'));
const SystemLogs = React.lazy(() => import('./pages/admin/SystemLogs'));
const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const ContentDashboard = React.lazy(() => import('./pages/admin/ContentDashboard'));

// Development only
const ErrorTestPage = React.lazy(() => import('./pages/ErrorTestPage'));

function App() {
    // Initialize optimizations
    useEffect(() => {
        initMobileOptimizations();
        initPerformanceOptimizations();
        initExpirationCleanup();

    }, []);

    return (
        <ErrorBoundary>
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
                                {/* ✅ PUBLIC ROUTES - Proper Outlet-based nesting */}
                                <Route path="/" element={<PublicLayout />}>
                                    <Route index element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <Home />
                                        </Suspense>
                                    } />

                                    <Route path="category/:slug" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <CategoryPage />
                                        </Suspense>
                                    } />

                                    <Route path="course/:slug" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <CourseDetail />
                                        </Suspense>
                                    } />

                                    <Route path="checkout/:slug" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <Checkout />
                                        </Suspense>
                                    } />

                                    <Route path="profile" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <UserProfile />
                                        </Suspense>
                                    } />

                                    <Route path="me/orders" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <MyOrders />
                                        </Suspense>
                                    } />

                                    <Route path="payment/manual/:paymentId" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <ManualPayment />
                                        </Suspense>
                                    } />

                                    <Route path="cart" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <Cart />
                                        </Suspense>
                                    } />

                                    <Route path="checkout-cart" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <CheckoutCart />
                                        </Suspense>
                                    } />

                                    {/* Development Routes */}
                                    {import.meta.env.DEV && (
                                        <Route path="error-test" element={
                                            <Suspense fallback={<PageSkeleton />}>
                                                <ErrorTestPage />
                                            </Suspense>
                                        } />
                                    )}

                                    {/* 404 Route */}
                                    <Route path="*" element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <NotFound />
                                        </Suspense>
                                    } />
                                </Route>

                                {/* ✅ AUTH ROUTES - Guest only with proper nesting */}
                                <Route path="/" element={<GuestOnly />}>
                                    <Route path="/" element={<PublicLayout />}>
                                        <Route path="login" element={
                                            <Suspense fallback={<PageSkeleton />}>
                                                <Login />
                                            </Suspense>
                                        } />

                                        <Route path="register" element={
                                            <Suspense fallback={<PageSkeleton />}>
                                                <Register />
                                            </Suspense>
                                        } />
                                    </Route>
                                </Route>

                                {/* ✅ ADMIN ROUTES - Proper nested structure with guards */}
                                <Route path="/admin" element={<RequireAdmin />}>
                                    <Route path="/admin" element={<AdminLayout />}>
                                        <Route index element={
                                            <Suspense fallback={<PageSkeleton />}>
                                                <DashboardHome />
                                            </Suspense>
                                        } />

                                        <Route path="courses" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'EducationManager', 'GeneralManager', 'DepartmentManager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <AdminCourses />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="my-courses" element={
                                            <RequireRole allowedRoles={['Instructor', 'EducationExpert', 'CourseSupport', 'Admin', 'Manager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <AdminCourses />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="my-students" element={
                                            <RequireRole allowedRoles={['Instructor', 'EducationExpert', 'CourseSupport', 'Admin', 'Manager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <MyStudents />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="categories" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'EducationManager', 'GeneralManager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <AdminCategories />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="users" element={
                                            <RequireRole allowedRoles={['Manager', 'GeneralManager', 'ITManager', 'DepartmentManager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <AdminUsers />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="courses/:courseId/schedules" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor', 'EducationManager', 'EducationExpert', 'CourseSupport']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <CourseSchedules />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="courses/:courseId/lms" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'Instructor', 'EducationManager', 'EducationExpert', 'CourseSupport']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <LMSManagement />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="accounting" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <Accounting />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="payments" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <PaymentManagement />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="reports" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <FinancialReports />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="content" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'EducationManager', 'ContentManager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <ContentDashboard />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="slides" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'EducationManager', 'ContentManager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <SlidesManagement />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="swagger" element={
                                            <Suspense fallback={<PageSkeleton />}>
                                                <SwaggerPage />
                                            </Suspense>
                                        } />

                                        <Route path="stories" element={
                                            <RequireRole allowedRoles={['Admin', 'Manager', 'GeneralManager', 'EducationManager', 'ContentManager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <StoriesManagement />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="system-settings" element={
                                            <RequireRole allowedRoles={['ITManager', 'Admin', 'Manager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <SystemSettings />
                                                </Suspense>
                                            } />
                                        </Route>

                                        <Route path="system-logs" element={
                                            <RequireRole allowedRoles={['ITManager', 'Admin', 'Manager']} />
                                        }>
                                            <Route index element={
                                                <Suspense fallback={<PageSkeleton />}>
                                                    <SystemLogs />
                                                </Suspense>
                                            } />
                                        </Route>
                                    </Route>
                                </Route>

                                {/* ✅ STUDENT ROUTES - Proper nested structure */}
                                <Route path="/student" element={
                                    <RequireRole allowedRoles={['Student', 'User']} />
                                }>
                                    <Route index element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <StudentDashboard />
                                        </Suspense>
                                    } />
                                </Route>
                            </Routes>
                        </Router>
                    </AppBootstrapProvider>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
