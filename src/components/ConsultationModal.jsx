import React, { useState } from 'react';
import { X, MessageCircle, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button, Input } from './UI';
import { apiClient } from '../services/api';

const ConsultationModal = ({ isOpen, onClose, courseId, courseName }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'نام و نام خانوادگی الزامی است';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'شماره تماس الزامی است';
        } else if (!/^09\d{9}$/.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'شماره تماس معتبر نیست (مثال: 09123456789)';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'ایمیل معتبر نیست';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'پیام الزامی است';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                fullName: formData.fullName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                email: formData.email.trim() || null,
                message: formData.message.trim(),
                courseId: courseId || null,
                courseName: courseName || null
            };

            await apiClient.post('/consultation', payload, {
                successMessage: 'درخواست مشاوره با موفقیت ثبت شد. کارشناسان ما به زودی با شما تماس می‌گیرند 📞'
            });

            // Reset form and close modal
            setFormData({
                fullName: '',
                phoneNumber: '',
                email: '',
                message: ''
            });
            onClose();
        } catch (error) {
            console.error('Error submitting consultation request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-secondary-500 p-6 rounded-t-3xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <MessageCircle size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">درخواست مشاوره</h2>
                            <p className="text-xs text-white/80 mt-1">کارشناسان ما به زودی با شما تماس می‌گیرند</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        aria-label="بستن"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Course Info (if provided) */}
                {courseName && (
                    <div className="px-6 pt-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">دوره مورد نظر:</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{courseName}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <User size={16} className="inline ml-1" />
                            نام و نام خانوادگی *
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="نام و نام خانوادگی خود را وارد کنید"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.fullName
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-slate-200 dark:border-slate-700'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all`}
                        />
                        {errors.fullName && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Phone size={16} className="inline ml-1" />
                            شماره تماس *
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="09123456789"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.phoneNumber
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-slate-200 dark:border-slate-700'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all dir-ltr text-right`}
                        />
                        {errors.phoneNumber && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Email (Optional) */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Mail size={16} className="inline ml-1" />
                            ایمیل (اختیاری)
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.email
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-slate-200 dark:border-slate-700'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all dir-ltr text-right`}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <MessageSquare size={16} className="inline ml-1" />
                            پیام شما *
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="لطفاً سوالات یا درخواست خود را بنویسید..."
                            rows="4"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.message
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-slate-200 dark:border-slate-700'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all resize-none`}
                        />
                        {errors.message && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.message}</p>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    در حال ارسال...
                                </span>
                            ) : (
                                'ارسال درخواست'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsultationModal;
