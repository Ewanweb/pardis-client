import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* 404 Animation */}
                <div className="relative mb-8">
                    <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                        404
                    </div>
                    <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-blue-100 dark:text-slate-700 -z-10 transform translate-x-2 translate-y-2">
                        404
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                        صفحه مورد نظر یافت نشد
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                        متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا ممکن است منتقل شده باشد.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            <Home size={20} />
                            بازگشت به صفحه اصلی
                        </Link>

                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-slate-300 rounded-lg transition-colors font-medium dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                            <BookOpen size={20} />
                            مشاهده دوره‌ها
                        </Link>
                    </div>

                    {/* Suggestions */}
                    <div className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            پیشنهادات مفید:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-start gap-2">
                                <Search size={16} className="mt-0.5 text-blue-500" />
                                <span>از نوار جستجو برای یافتن محتوای مورد نظر استفاده کنید</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <ArrowLeft size={16} className="mt-0.5 text-green-500" />
                                <span>به صفحه قبلی بازگردید و مسیر صحیح را انتخاب کنید</span>
                            </div>
                        </div>
                    </div>

                    {/* Popular Links */}
                    <div className="mt-8">
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                            لینک‌های پربازدید:
                        </h4>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Link
                                to="/courses"
                                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                            >
                                دوره‌های آموزشی
                            </Link>
                            <Link
                                to="/about"
                                className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                            >
                                درباره ما
                            </Link>
                            <Link
                                to="/contact"
                                className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800"
                            >
                                تماس با ما
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-5 w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
};

export default NotFound;