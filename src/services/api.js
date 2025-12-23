import axios from "axios";
import ApiResponseHandler from "./ApiResponseHandler";
/**
 * API Configuration
 *
 * برای تغییر آدرس API، یکی از روش‌های زیر را انتخاب کنید:
 *
 * 1. تغییر در فایل .env:
 *    VITE_API_BASE_URL=https://api.pardistous.ir
 *
 * 2. تغییر مستقیم در این فایل:
 *    DEFAULT_API_URL را تغییر دهید
 */
// آدرس پیش‌فرض API - فقط این خط را تغییر دهید
const DEFAULT_API_URL = "https://localhost:44367";
// آدرس API از environment variable یا مقدار پیش‌فرض
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;
// حذف slash انتهایی اگر وجود داشته باشد
export const SERVER_URL = API_BASE_URL.replace(/\/$/, "");
// آدرس کامل API با /api در انتها
export const API_URL = `${SERVER_URL}/api`;
// Debug information (فقط در محیط development)
if (import.meta.env.DEV) {
}
// ایجاد instance از axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});
// Request interceptor برای اضافه کردن token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);
// Response interceptor برای مدیریت خطاها
api.interceptors.response.use(
  (response) => {
    // Log response در محیط development
    
    return response;
  },
  (error) => {
    // Log error در محیط development
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.data || error.message
      );
    }
    // مدیریت خطای 401 (Unauthorized)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // فقط redirect کن اگر در صفحات auth نیستیم
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        console.warn("🔒 Token expired or invalid. Redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect به صفحه login
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }
    // مدیریت خطای 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error(
        "🚫 Access denied. You don't have permission to access this resource."
      );
    }
    // مدیریت خطای 404 (Not Found)
    if (error.response?.status === 404) {
      console.warn("🔍 Resource not found:", error.config?.url);
    }
    // مدیریت خطای 500 (Server Error)
    if (error.response?.status >= 500) {
      console.error("🔥 Server error. Please try again later.");
    }
    // مدیریت خطای شبکه
    if (!error.response) {
      console.error("🌐 Network error. Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);
/**
 * API Wrapper با مدیریت خودکار Alert ها
 */
export class ApiClient {
  constructor(options = {}) {
    this.defaultOptions = {
      showSuccessAlert: true,
      showErrorAlert: true,
      ...options,
    };
  }
  async get(url, options = {}) {
    try {
      const response = await api.get(url);
      return this._handleSuccess(response, {
        showSuccessAlert: false, // GET معمولاً نیاز به success alert ندارد
        ...options,
      });
    } catch (error) {
      return this._handleError(error, options);
    }
  }
  async post(url, data, options = {}) {
    try {
      const response = await api.post(url, data);
      return this._handleSuccess(response, options);
    } catch (error) {
      return this._handleError(error, options);
    }
  }
  async put(url, data, options = {}) {
    try {
      const response = await api.put(url, data);
      return this._handleSuccess(response, options);
    } catch (error) {
      return this._handleError(error, options);
    }
  }
  async patch(url, data, options = {}) {
    try {
      const response = await api.patch(url, data);
      return this._handleSuccess(response, options);
    } catch (error) {
      return this._handleError(error, options);
    }
  }
  async delete(url, options = {}) {
    try {
      const response = await api.delete(url);
      return this._handleSuccess(response, options);
    } catch (error) {
      return this._handleError(error, options);
    }
  }
  _handleSuccess(response, options) {
    const opts = { ...this.defaultOptions, ...options };
    return ApiResponseHandler.handleSuccess(response.data, opts);
  }
  _handleError(error, options) {
    const opts = { ...this.defaultOptions, ...options };
    return ApiResponseHandler.handleError(error, opts);
  }
}
// Instance پیش‌فرض
export const apiClient = new ApiClient();
// Export default برای استفاده راحت‌تر
export default api;
