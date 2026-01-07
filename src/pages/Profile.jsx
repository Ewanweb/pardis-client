import React, { useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import AvatarUpload from '../components/profile/AvatarUpload';
import ProfileForm from '../components/profile/ProfileForm';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const {
        profile,
        loading,
        error,
        updating,
        uploadingAvatar,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        clearError,
    } = useProfile();

    const [successMessage, setSuccessMessage] = React.useState('');

    // Clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleProfileUpdate = async (profileData) => {
        const result = await updateProfile(profileData);
        if (result.success) {
            setSuccessMessage('پروفایل با موفقیت به‌روزرسانی شد');
        }
    };

    const handleAvatarUpload = async (file) => {
        const result = await uploadAvatar(file);
        if (result.success) {
            setSuccessMessage('آواتار با موفقیت آپلود شد');
        }
    };

    const handleAvatarDelete = async () => {
        const result = await deleteAvatar();
        if (result.success) {
            setSuccessMessage('آواتار با موفقیت حذف شد');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        دسترسی غیرمجاز
                    </h2>
                    <p className="text-gray-600">
                        برای مشاهده این صفحه باید وارد حساب کاربری خود شوید
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">در حال بارگذاری اطلاعات پروفایل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <User className="w-8 h-8 text-blue-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">پروفایل کاربری</h1>
                            <p className="text-gray-600 mt-1">
                                اطلاعات شخصی و تنظیمات حساب کاربری خود را مدیریت کنید
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                            <p className="text-green-800">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                                <p className="text-red-800">{error}</p>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-500 hover:text-red-700"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                تصویر پروفایل
                            </h2>
                            <AvatarUpload
                                currentAvatar={profile?.avatarUrl}
                                onUpload={handleAvatarUpload}
                                onDelete={handleAvatarDelete}
                                uploading={uploadingAvatar}
                            />
                        </div>

                        {/* Profile Summary */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                خلاصه پروفایل
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">نام کامل</p>
                                    <p className="font-medium">
                                        {profile?.fullName || 'تعریف نشده'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ایمیل</p>
                                    <p className="font-medium">
                                        {profile?.email || 'تعریف نشده'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">شماره موبایل</p>
                                    <p className="font-medium">
                                        {profile?.mobile || 'تعریف نشده'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">تاریخ عضویت</p>
                                    <p className="font-medium">
                                        {profile?.createdAt
                                            ? new Date(profile.createdAt).toLocaleDateString('fa-IR')
                                            : 'تعریف نشده'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <ProfileForm
                            profile={profile}
                            onSubmit={handleProfileUpdate}
                            loading={updating}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;