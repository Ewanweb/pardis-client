import { useState, useEffect } from 'react';
import { Save, User, Phone, Mail, Calendar, MapPin, FileText } from 'lucide-react';

const ProfileForm = ({
    profile,
    onSubmit,
    loading = false,
    className = ''
}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        bio: '',
        birthDate: '',
        gender: '',
        address: '',
    });

    const [errors, setErrors] = useState({});

    // Update form data when profile changes
    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                phoneNumber: profile.phoneNumber || profile.mobile || '',
                bio: profile.bio || '',
                birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
                gender: profile.gender?.toString() || '',
                address: profile.address || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate phone number
        if (formData.phoneNumber && !/^09\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = `O'U.O
O?U? U.U^O"O
UOU, O"O
UOO_ O"O
 09 O'O?U^O1 O'O_U? U^ 11 O?U,U. O"O
O'O_`;
        }

        // Validate birth date
        if (formData.birthDate) {
            const birthDate = new Date(formData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 10 || age > 120) {
                newErrors.birthDate = `O?O
O?UOOr O?U^U,O_ U.O1O?O"O? U+UOO3O?`;
            }
        }

        // Validate text lengths
        if (formData.fullName && formData.fullName.length > 200) {
            newErrors.fullName = `U+O
U. U+U.UO??OO?U^O
U+O_ U+U.UO??OO?U^O
U+O_ O"UOO' O
O? 200 UcO
O?O
UcO?O? O"O
O'O_`;
        }

        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = `O"UOU^U_O?O
U?UO U+U.UO??OO?U^O
U+O_ O"UOO' O
O? 500 UcO
O?O
UcO?O? O"O
O'O_`;
        }

        if (formData.address && formData.address.length > 500) {
            newErrors.address = `O?O_O?O3 U+U.UO??OO?U^O
U+O_ O"UOO' O
O? 500 UcO
O?O
UcO?O? O"O
O'O_`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            FullName: formData.fullName ? formData.fullName.trim() : null,
            PhoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
            Bio: formData.bio ? formData.bio.trim() : null,
            BirthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
            Gender: formData.gender ? parseInt(formData.gender, 10) : null,
            Address: formData.address ? formData.address.trim() : null
        };

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 ml-2" />
                    اطلاعات شخصی
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            U+OU. U+U.UO??OO?U^OU+O_
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`
                w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.fullName ? 'border-red-500' : 'border-gray-300'}
              `}
                            placeholder="U+OU. U+U.UO??OO?U^OU+O_ OrU^O_ O?O U^OO?O_ UcU+UOO_"
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Phone className="w-4 h-4 ml-1" />
                            شماره موبایل
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className={`
                w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}
              `}
                            placeholder="09123456789"
                            dir="ltr"
                        />
                        {errors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Mail className="w-4 h-4 ml-1" />
                            ایمیل
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={profile?.email || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            placeholder="ایمیل شما"
                        />
                        <p className="mt-1 text-xs text-gray-500">ایمیل قابل تغییر نیست</p>
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Calendar className="w-4 h-4 ml-1" />
                            تاریخ تولد
                        </label>
                        <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className={`
                w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}
              `}
                        />
                        {errors.birthDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                            جنسیت
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="1">مرد</option>
                            <option value="2">زن</option>
                            <option value="3">سایر</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 ml-2" />
                    اطلاعات تکمیلی
                </h3>

                <div className="space-y-4">
                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            بیوگرافی
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={4}
                            className={`
                w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.bio ? 'border-red-500' : 'border-gray-300'}
              `}
                            placeholder="درباره خود بنویسید..."
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.bio && (
                                <p className="text-sm text-red-600">{errors.bio}</p>
                            )}
                            <p className="text-xs text-gray-500 mr-auto">
                                {formData.bio.length}/500 کاراکتر
                            </p>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <MapPin className="w-4 h-4 ml-1" />
                            آدرس
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className={`
                w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.address ? 'border-red-500' : 'border-gray-300'}
              `}
                            placeholder="آدرس محل سکونت خود را وارد کنید"
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.address && (
                                <p className="text-sm text-red-600">{errors.address}</p>
                            )}
                            <p className="text-xs text-gray-500 mr-auto">
                                {formData.address.length}/500 کاراکتر
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="
            px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
            flex items-center space-x-2 space-x-reverse transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>{loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</span>
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;
