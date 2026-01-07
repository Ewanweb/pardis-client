import { useState, useEffect, useRef, useCallback } from 'react';
import { X, User, Save, AlertCircle, Camera, Phone, Calendar, MapPin, FileText, Loader2 } from 'lucide-react';
import { Button, Input } from '../UI';
import AvatarUpload from './AvatarUpload';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


const ProfileEditModal = ({ isOpen, onClose }) => {
    const { user, fetchUser } = useAuth();
    const modalRef = useRef(null);
    const firstInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        bio: '',
        birthDate: '',
        gender: '',
    });

    const [profile, setProfile] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const {
        loading,
        uploading,
        error,
        getProfile,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        clearError,
    } = useProfile();

    // Initialize form data when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const loadProfile = async () => {
            const result = await getProfile();
            const data = result?.success ? (result.data || {}) : {};

            setProfile(result?.success ? data : null);
            setFormData({
                fullName: data.fullName || user?.fullName || '',
                phoneNumber: data.phoneNumber || user?.phoneNumber || user?.mobile || '',
                bio: data.bio || '',
                birthDate: data.birthDate ? String(data.birthDate).split('T')[0] : '',
                gender: data.gender != null ? String(data.gender) : '',
            });

            setFormErrors({});
            setHasUnsavedChanges(false);
            clearError();
        };

        loadProfile();
    }, [isOpen, user, getProfile, clearError]);

    // Focus management and ESC key handling
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Focus trap
    useEffect(() => {
        if (!isOpen) return;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        modal.addEventListener('keydown', handleTabKey);
        return () => modal.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    const handleClose = () => {
        if (loading || uploading) return;

        if (hasUnsavedChanges) {
            if (window.confirm('تغییرات ذخیره نشده‌ای دارید. آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            setHasUnsavedChanges(true);

            if (formErrors[name]) {
                setFormErrors((prev) => ({
                    ...prev,
                    [name]: '',
                }));
            }
        },
        [formErrors]
    );

    const validateForm = () => {
        const errors = {};

        // Validate mobile number
        if (formData.phoneNumber && !/^09\d{9}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد';
        }

        // Validate birth date
        if (formData.birthDate) {
            const birthDate = new Date(formData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 10 || age > 120) {
                errors.birthDate = 'تاریخ تولد معتبر نیست';
            }
        }

        // Validate text lengths
        if (formData.fullName && formData.fullName.length > 200) {
            errors.fullName = 'نام کامل نمی‌تواند بیش از 200 کاراکتر باشد';
        }

        if (formData.bio && formData.bio.length > 500) {
            errors.bio = 'بیوگرافی نمی‌تواند بیش از 500 کاراکتر باشد';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            // Convert to PascalCase for backend compatibility
            const submitData = {
                FullName: formData.fullName ? formData.fullName.trim() : null,
                PhoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
                Bio: formData.bio ? formData.bio.trim() : null,
                BirthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
                Gender: formData.gender ? parseInt(formData.gender, 10) : null,
            };

            const result = await updateProfile(submitData);

            if (result?.success) {
                await fetchUser();
                setProfile(result.data || profile);
                toast.success('پروفایل با موفقیت به‌روزرسانی شد');
                setHasUnsavedChanges(false);
                onClose();
            } else {
                toast.error(result?.message || 'خطا در به‌روزرسانی پروفایل');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('خطا در به‌روزرسانی پروفایل');
        }
    };

    const handleAvatarUpload = async (file) => {
        try {
            const result = await uploadAvatar(file);

            if (result?.success) {
                await fetchUser();
                setProfile(result.data || profile);
                toast.success('آواتار با موفقیت آپلود شد');
            } else {
                toast.error(result?.message || 'خطا در آپلود آواتار');
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            toast.error('خطا در آپلود آواتار');
        }
    };

    const handleAvatarDelete = async () => {
        try {
            const result = await deleteAvatar();

            if (result?.success) {
                await fetchUser();
                setProfile(result.data || profile);
                toast.success('آواتار با موفقیت حذف شد');
            } else {
                toast.error(result?.message || 'خطا در حذف آواتار');
            }
        } catch (err) {
            console.error('Error deleting avatar:', err);
            toast.error('خطا در حذف آواتار');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-title"
            aria-describedby="profile-edit-description"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden border border-slate-200/50 dark:border-slate-800/50 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-slate-800 dark:to-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 id="profile-edit-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                ویرایش پروفایل
                            </h2>
                            <p id="profile-edit-description" className="text-sm text-slate-600 dark:text-slate-400">
                                اطلاعات پروفایل خود را ویرایش کنید و سپس ذخیره کنید.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={loading || uploading}
                        className="!p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto">
                    <form id="profile-edit-form" onSubmit={handleSubmit} className="p-6">
                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-800 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Avatar Section */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Camera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">آواتار پروفایل</h3>
                                    </div>

                                    <AvatarUpload
                                        currentAvatar={profile?.avatarUrl || user?.avatarUrl}
                                        onUpload={handleAvatarUpload}
                                        onDelete={handleAvatarDelete}
                                        uploading={uploading}
                                        className="w-full"
                                    />
                                </div>

                                {/* Profile Summary */}
                                <div className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">خلاصه پروفایل</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">نام کامل</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {profile?.fullName || user?.fullName || user?.name || 'تعریف نشده'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">ایمیل</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {profile?.email || user?.email || 'تعریف نشده'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">شماره موبایل</p>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {profile?.phoneNumber || user?.phoneNumber || user?.mobile || 'تعریف نشده'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information Section */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-6">
                                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">اطلاعات شخصی</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                نام کامل
                                            </label>
                                            <Input
                                                ref={firstInputRef}
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                placeholder="نام کامل خود را وارد کنید"
                                                error={formErrors.fullName}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Phone className="w-4 h-4 inline ml-1" />
                                                شماره موبایل
                                            </label>
                                            <Input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="09xxxxxxxxx"
                                                error={formErrors.phoneNumber}
                                                className="w-full"
                                                dir="ltr"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Calendar className="w-4 h-4 inline ml-1" />
                                                تاریخ تولد (شمسی)
                                            </label>

                                            <DatePicker
                                                portal
                                                zIndex={999999}
                                                calendar={persian}
                                                locale={persian_fa}
                                                format="YYYY/MM/DD"
                                                calendarPosition="bottom-right"
                                                containerClassName="w-full"
                                                inputClass="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-slate-100 transition-colors"
                                                value={formData.birthDate || null}
                                                onChange={(dateObj) => {
                                                    const iso = dateObj ? dateObj.toDate().toISOString().slice(0, 10) : "";
                                                    setFormData((p) => ({ ...p, birthDate: iso }));
                                                    setHasUnsavedChanges(true);
                                                    if (formErrors.birthDate) setFormErrors((p) => ({ ...p, birthDate: "" }));
                                                }}
                                            />

                                            {formErrors.birthDate && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.birthDate}</p>
                                            )}
                                        </div>


                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                جنسیت
                                            </label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-slate-100 transition-colors"
                                            >
                                                <option value="">انتخاب کنید</option>
                                                <option value="Male">مرد</option>
                                                <option value="Female">زن</option>
                                                <option value="Other">سایر</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-6">
                                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">اطلاعات تکمیلی</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                بیوگرافی
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                placeholder="چند خط درباره خودتان بنویسید..."
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-slate-100 transition-colors resize-none"
                                            />
                                            {formErrors.bio && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.bio}</p>
                                            )}
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {formData.bio.length}/500 کاراکتر
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={loading || uploading} className="px-6">
                        انصراف
                    </Button>

                    <Button
                        type="submit"
                        form="profile-edit-form"
                        disabled={loading || uploading}
                        className="px-8 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                در حال ذخیره...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                ذخیره تغییرات
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default ProfileEditModal;
