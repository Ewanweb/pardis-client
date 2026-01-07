import { useState, useRef } from 'react';
import { Camera, Trash2, Upload, User } from 'lucide-react';
import { Button } from '../UI';

const AvatarUpload = ({
    currentAvatar,
    onUpload,
    onDelete,
    uploading = false,
    className = ''
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('فرمت فایل مجاز نیست. فرمت‌های مجاز: JPG, JPEG, PNG, WEBP');
            return;
        }

        // Validate file size (2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('حجم فایل نباید بیش از 2 مگابایت باشد');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        onUpload(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDeleteAvatar = () => {
        if (window.confirm('آیا از حذف آواتار اطمینان دارید؟')) {
            setPreviewUrl(null);
            onDelete();
        }
    };

    const avatarUrl = previewUrl || currentAvatar;

    return (
        <div className={`flex flex-col items-center space-y-4 ${className}`}>
            {/* Avatar Display */}
            <div className="relative">
                <div
                    className={`
            relative w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-700 overflow-hidden
            ${dragOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''}
            ${uploading ? 'opacity-50' : ''}
          `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="آواتار کاربر"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                        </div>
                    )}

                    {/* Upload Overlay */}
                    {dragOver && (
                        <div className="absolute inset-0 bg-primary-500 bg-opacity-50 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>

                {/* Camera Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    className="
            absolute bottom-0 right-0 w-10 h-10 bg-primary-500 hover:bg-primary-600 
            text-white rounded-full flex items-center justify-center
            shadow-lg transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
                >
                    <Camera className="w-5 h-5" />
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 space-x-reverse">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                >
                    <Upload className="w-4 h-4" />
                    انتخاب تصویر
                </Button>

                {currentAvatar && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAvatar();
                        }}
                        disabled={uploading}
                        className="!text-red-600 !border-red-200 hover:!bg-red-50 dark:!border-red-800 dark:hover:!bg-red-900/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        حذف آواتار
                    </Button>
                )}
            </div>

            {/* File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Help Text */}
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                فرمت‌های مجاز: JPG, PNG, WEBP<br />
                حداکثر حجم: 2 مگابایت
            </p>
        </div>
    );
};

export default AvatarUpload;