import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Sparkles, MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';

const FAQ = ({ faqItems = [], title = "پرسش‌های پرتکرار", subtitle = "پاسخ‌های کوتاه و شفاف به سوالات رایج" }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const defaultFAQs = [
        {
            question: 'از چه سطحی می‌توانم یادگیری را شروع کنم؟',
            answer: 'بیشتر دوره‌ها از سطح مقدماتی طراحی شده‌اند و مسیر یادگیری قدم‌به‌قدم را پوشش می‌دهند. حتی اگر هیچ پیش‌زمینه‌ای نداشته باشید، می‌توانید با آرامش شروع کنید.',
            icon: HelpCircle,
            color: 'from-blue-500 to-indigo-600'
        },
        {
            question: 'آیا دوره‌ها پروژه‌محور هستند؟',
            answer: 'بله، هر دوره شامل تمرین عملی و پروژه‌های واقعی برای ساخت رزومه است. شما در طول دوره چندین پروژه کامل خواهید ساخت که می‌توانید در رزومه خود قرار دهید.',
            icon: CheckCircle,
            color: 'from-emerald-500 to-teal-600'
        },
        {
            question: 'پشتیبانی چگونه انجام می‌شود؟',
            answer: 'پشتیبانی توسط مدرس و منتورها در طول دوره انجام می‌شود تا مسیر یادگیری شما بدون توقف باشد. همچنین انجمن پرسش و پاسخ برای تعامل با سایر دانشجویان در دسترس است.',
            icon: MessageCircle,
            color: 'from-purple-500 to-pink-600'
        },
        {
            question: 'مدت زمان دسترسی به دوره چقدر است؟',
            answer: 'دسترسی به دوره‌ها مادام‌العمر است. می‌توانید هر زمان که خواستید به محتوای دوره بازگردید و از آپدیت‌های جدید نیز بهره‌مند شوید.',
            icon: Sparkles,
            color: 'from-amber-500 to-orange-600'
        },
        {
            question: 'آیا مدرک ارائه می‌شود؟',
            answer: 'بله، پس از تکمیل موفقیت‌آمیز دوره، مدرک معتبر فنی و حرفه‌ای دریافت خواهید کرد که قابل ترجمه و استفاده در رزومه و مهاجرت است.',
            icon: CheckCircle,
            color: 'from-rose-500 to-red-600'
        },
        {
            question: 'آیا امکان پرداخت اقساطی وجود دارد؟',
            answer: 'بله، برای راحتی شما امکان پرداخت اقساطی در نظر گرفته شده است. می‌توانید دوره را در چند قسط پرداخت کنید و بلافاصله شروع به یادگیری کنید.',
            icon: ArrowRight,
            color: 'from-cyan-500 to-blue-600'
        }
    ];

    const faqs = faqItems.length > 0 ? faqItems : defaultFAQs;

    return (
        <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-purple-100/20 dark:from-indigo-900/10 dark:to-purple-900/10"></div>
            <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white mb-6 shadow-lg shadow-indigo-500/25 animate-in fade-in zoom-in duration-500">
                        <HelpCircle size={28} />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                {/* FAQ Grid */}
                <div className="max-w-4xl mx-auto">
                    <div className="grid gap-6">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            const IconComponent = faq.icon || HelpCircle;

                            return (
                                <div
                                    key={index}
                                    className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden ${isOpen ? 'ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/10' : ''
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full p-6 text-right flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-300"
                                    >
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${faq.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent size={20} />
                                        </div>

                                        {/* Question */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                                                {faq.question}
                                            </h3>
                                        </div>

                                        {/* Toggle Icon */}
                                        <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''
                                            }`}>
                                            <ChevronDown size={16} />
                                        </div>
                                    </button>

                                    {/* Answer */}
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        <div className="px-6 pb-6">
                                            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl p-6 border-r-4 border-indigo-500">
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl shadow-indigo-500/25">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            سوال دیگری دارید؟
                        </h3>
                        <p className="text-indigo-100 mb-6">
                            تیم پشتیبانی ما آماده پاسخگویی به سوالات شماست
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                تماس با پشتیبانی
                            </button>
                            <button className="px-6 py-3 bg-indigo-800/50 backdrop-blur border border-indigo-400/30 text-white rounded-xl font-bold hover:bg-indigo-800 transition-colors">
                                مشاهده راهنما
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;