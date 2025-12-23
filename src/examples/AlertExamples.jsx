/**
 * نمونه‌های استفاده از Alert System
 */

import React from 'react';
import { useAlert } from '../hooks/useAlert';
import { apiClient } from '../services/api';

const AlertExamples = () => {
    const alert = useAlert();

    // نمونه استفاده در عملیات CRUD
    const handleCreateCourse = async (courseData) => {
        try {
            const result = await apiClient.post('/courses', courseData, {
                successMessage: 'دوره با موفقیت ایجاد شد'
            });

            if (result.success) {
                // Alert خودکار نمایش داده می‌شود
                console.log('Course created:', result.data);
            }
        } catch (error) {
            // Alert خطا خودکار نمایش داده می‌شود
            console.error('Failed to create course:', error);
        }
    };

    // نمونه استفاده دستی
    const handleManualAlert = () => {
        alert.showSuccess('این یک پیام موفقیت دستی است!', {
            duration: 3000,
            actions: [{
                label: 'مشاهده جزئیات',
                action: () => console.log('Details clicked')
            }]
        });
    };

    // نمونه Confirm Dialog
    const handleDeleteCourse = (courseId, courseName) => {
        alert.showConfirmDelete(`دوره "${courseName}"`, async () => {
            try {
                const result = await apiClient.delete(`/courses/${courseId}`);
                if (result.success) {
                    // Alert موفقیت خودکار نمایش داده می‌شود
                    console.log('Course deleted');
                }
            } catch (error) {
                // Alert خطا خودکار نمایش داده می‌شود
                console.error('Failed to delete course');
            }
        });
    };

    // نمونه Loading Alert
    const handleLongOperation = async () => {
        const loadingAlertId = alert.showLoading('در حال پردازش اطلاعات...');

        try {
            // شبیه‌سازی عملیات طولانی
            await new Promise(resolve => setTimeout(resolve, 3000));

            alert.dismiss(loadingAlertId);
            alert.showSuccess('عملیات با موفقیت انجام شد');
        } catch (error) {
            alert.dismiss(loadingAlertId);
            alert.showError('خطا در انجام عملیات');
        }
    };

    // نمونه Validation Error
    const handleFormSubmit = (formData) => {
        const errors = validateForm(formData);

        if (errors.length > 0) {
            alert.showValidationError(`${errors.length} خطای اعتبارسنجی وجود دارد`);
            return;
        }

        // ادامه پردازش فرم...
    };

    const validateForm = (data) => {
        const errors = [];
        if (!data.title) errors.push('عنوان الزامی است');
        if (!data.description) errors.push('توضیحات الزامی است');
        return errors;
    };

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-6">نمونه‌های Alert System</h2>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handleManualAlert}
                    className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    نمایش Alert موفقیت
                </button>

                <button
                    onClick={() => alert.showError('این یک پیام خطا است!')}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    نمایش Alert خطا
                </button>

                <button
                    onClick={() => alert.showWarning('این یک پیام هشدار است!')}
                    className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                    نمایش Alert هشدار
                </button>

                <button
                    onClick={() => alert.showInfo('این یک پیام اطلاعات است!')}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    نمایش Alert اطلاعات
                </button>

                <button
                    onClick={() => handleDeleteCourse('123', 'دوره React')}
                    className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Confirm Delete
                </button>

                <button
                    onClick={handleLongOperation}
                    className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                    عملیات طولانی
                </button>

                <button
                    onClick={() => handleFormSubmit({})}
                    className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    خطای Validation
                </button>

                <button
                    onClick={alert.dismissAll}
                    className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    بستن همه Alert ها
                </button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold mb-2">نحوه استفاده:</h3>
                <pre className="text-sm bg-white p-3 rounded overflow-x-auto">
                    {`// استفاده از Hook
const alert = useAlert();

// Alert های ساده
alert.showSuccess('عملیات موفق بود');
alert.showError('خطایی رخ داد');

// Alert با Action
alert.showSuccess('فایل آپلود شد', {
  actions: [{
    label: 'مشاهده',
    action: () => openFile()
  }]
});

// استفاده با API Client
const result = await apiClient.post('/api/data', data, {
  successMessage: 'داده ذخیره شد',
  errorMessage: 'خطا در ذخیره داده'
});`}
                </pre>
            </div>
        </div>
    );
};

export default AlertExamples;