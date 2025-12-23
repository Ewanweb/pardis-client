import React from 'react';
import {
    Heart,
    Mail,
    Phone,
    MapPin,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    BookOpen,
    Users,
    Award,
    Zap,
    ArrowUp,
    ExternalLink,
    Globe,
    MessageCircle,
    Star,
    Sparkles
} from 'lucide-react';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentYear = new Date().getFullYear();
    const persianYear = currentYear - 621; // تبدیل به سال شمسی تقریبی

    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>

            <div className="relative z-10">
                {/* Main Footer Content */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                        {/* Brand Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                    <Sparkles className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">پردیس توس</h3>
                                    <p className="text-indigo-300 text-sm font-medium">آکادمی آنلاین</p>
                                </div>
                            </div>

                            <p className="text-slate-300 leading-relaxed">
                                بهترین پلتفرم آموزش آنلاین ایران با بیش از ۱۰۰۰ دوره تخصصی و اساتید مجرب.
                                مسیر یادگیری خود را با ما آغاز کنید.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                                    <div className="text-2xl font-black text-indigo-400">۱۰۰۰+</div>
                                    <div className="text-xs text-slate-400">دوره آموزشی</div>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                                    <div className="text-2xl font-black text-emerald-400">۵۰۰۰+</div>
                                    <div className="text-xs text-slate-400">دانشجو</div>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                                    <div className="text-2xl font-black text-amber-400">۱۰۰+</div>
                                    <div className="text-xs text-slate-400">مدرس</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-black text-white flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-400" />
                                دسترسی سریع
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    { name: 'دوره‌های آموزشی', href: '/courses' },
                                    { name: 'دسته‌بندی‌ها', href: '/categories' },
                                    { name: 'اساتید', href: '/instructors' },
                                    { name: 'وبلاگ', href: '/blog' },
                                    { name: 'درباره ما', href: '/about' },
                                    { name: 'تماس با ما', href: '/contact' }
                                ].map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-indigo-400 transition-colors duration-300"></div>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-black text-white flex items-center gap-2">
                                <Zap size={20} className="text-emerald-400" />
                                خدمات ما
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    { name: 'دوره‌های آنلاین', icon: Globe },
                                    { name: 'کلاس‌های زنده', icon: Users },
                                    { name: 'مشاوره تحصیلی', icon: MessageCircle },
                                    { name: 'گواهینامه معتبر', icon: Award },
                                    { name: 'پشتیبانی ۲۴/۷', icon: Heart },
                                    { name: 'اپلیکیشن موبایل', icon: Phone }
                                ].map((service, index) => (
                                    <li key={index}>
                                        <div className="text-slate-300 flex items-center gap-3 group cursor-pointer hover:text-emerald-400 transition-colors duration-300">
                                            <service.icon size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors duration-300" />
                                            {service.name}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-black text-white flex items-center gap-2">
                                <Phone size={20} className="text-pink-400" />
                                تماس با ما
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300">
                                    <MapPin size={18} className="text-pink-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-white font-bold text-sm">آدرس دفتر مرکزی</div>
                                        <div className="text-slate-300 text-sm">تهران، خیابان ولیعصر، پلاک ۱۲۳</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300">
                                    <Phone size={18} className="text-emerald-400" />
                                    <div>
                                        <div className="text-white font-bold text-sm">تلفن پشتیبانی</div>
                                        <div className="text-slate-300 text-sm" dir="ltr">021-1234-5678</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300">
                                    <Mail size={18} className="text-indigo-400" />
                                    <div>
                                        <div className="text-white font-bold text-sm">ایمیل</div>
                                        <div className="text-slate-300 text-sm" dir="ltr">info@pardistous.ir</div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h5 className="text-white font-bold mb-3">شبکه‌های اجتماعی</h5>
                                <div className="flex gap-3">
                                    {[
                                        { icon: Instagram, color: 'hover:bg-pink-500', href: '#' },
                                        { icon: Twitter, color: 'hover:bg-blue-500', href: '#' },
                                        { icon: Linkedin, color: 'hover:bg-blue-600', href: '#' },
                                        { icon: Youtube, color: 'hover:bg-red-500', href: '#' }
                                    ].map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            className={`w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                                        >
                                            <social.icon size={18} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="border-t border-white/10">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-right">
                                <h4 className="text-xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                                    <Star className="text-amber-400" size={20} />
                                    عضویت در خبرنامه
                                </h4>
                                <p className="text-slate-300">از آخرین دوره‌ها و تخفیف‌های ویژه باخبر شوید</p>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <input
                                    type="email"
                                    placeholder="ایمیل خود را وارد کنید"
                                    className="flex-1 md:w-80 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                                    dir="ltr"
                                />
                                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
                                    <Mail size={18} />
                                    عضویت
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-slate-400 text-sm text-center md:text-right">
                                © {persianYear} آکادمی پردیس توس - تمامی حقوق محفوظ است
                                <span className="mx-2">•</span>
                                ساخته شده با
                                <Heart size={14} className="inline mx-1 text-red-400" />
                                در ایران
                            </div>

                            <div className="flex items-center gap-6">
                                <a href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors duration-300">
                                    حریم خصوصی
                                </a>
                                <a href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors duration-300">
                                    قوانین و مقررات
                                </a>
                                <button
                                    onClick={scrollToTop}
                                    className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
                                    title="بازگشت به بالا"
                                >
                                    <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;