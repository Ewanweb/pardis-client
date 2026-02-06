import axios from "axios";
import ApiResponseHandler from "./ApiResponseHandler";

/**
 * 🎯 مرکز مدیریت API - تنها نقطه تغییر برای کل سیستم
 *
 * برای تغییر آدرس API:
 *
 * 🔧 تغییر مستقیم در این فایل:
 *    DEFAULT_API_URL را تغییر دهید
 *
 * 🔧 یا استفاده از متد setApiUrl() در runtime:
 *    ApiManager.setApiUrl("https://new-api-url.com")
 */

/**
 * 📍 تنظیمات مرکزی API
 */
class ApiConfig {
  constructor() {
    // آدرس پیش‌فرض API - فقط این خط را تغییر دهید
    this.DEFAULT_API_URL = "https://api.pardistousac.ir";

    // تنظیمات پیش‌فرض
    this.config = {
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    this._initializeUrls();
  }

  _initializeUrls() {
    // استفاده فقط از DEFAULT_API_URL (بدون وابستگی به environment variables)
    const baseUrl = this.DEFAULT_API_URL;

    // حذف slash انتهایی اگر وجود داشته باشد
    this.SERVER_URL = baseUrl.replace(/\/$/, "");

    // آدرس کامل API با /api در انتها
    this.API_URL = `${this.SERVER_URL}/api`;

    // Debug information (فقط در محیط development)
    if (import.meta.env.DEV) {
      console.log("🔗 API Configuration:");
      console.log("  DEFAULT_API_URL:", this.DEFAULT_API_URL);
      console.log("  Server URL:", this.SERVER_URL);
      console.log("  API URL:", this.API_URL);
      console.log("  Environment:", import.meta.env.MODE);
      console.log(
        "  ⚠️ Note: API URL is managed centrally in this file. No environment variables used.",
      );
    }
  }

  /**
   * تغییر آدرس API در runtime
   * @param {string} newUrl - آدرس جدید API
   */
  setApiUrl(newUrl) {
    this.DEFAULT_API_URL = newUrl;
    this._initializeUrls();

    // بروزرسانی axios instance
    api.defaults.baseURL = this.API_URL;

  }

  /**
   * دریافت تنظیمات فعلی
   */
  getCurrentConfig() {
    return {
      serverUrl: this.SERVER_URL,
      apiUrl: this.API_URL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    };
  }

  /**
   * تغییر timeout برای تمام درخواست‌ها
   */
  setTimeout(timeout) {
    this.config.timeout = timeout;
    api.defaults.timeout = timeout;
  }

  /**
   * اضافه کردن header سراسری
   */
  setGlobalHeader(key, value) {
    this.config.headers[key] = value;
    api.defaults.headers.common[key] = value;
  }

  /**
   * اجباری تنظیم API به production
   */
  forceProductionApi() {
    const productionUrl = "https://localhost:44367";
    this.DEFAULT_API_URL = productionUrl;
    this.SERVER_URL = productionUrl;
    this.API_URL = `${productionUrl}/api`;

    // بروزرسانی axios instance
    api.defaults.baseURL = this.API_URL;

    console.log("🔧 API اجباری به production تنظیم شد:", this.API_URL);
    return this.API_URL;
  }
}

// ایجاد instance واحد از تنظیمات
const apiConfig = new ApiConfig();

// Export کردن URL ها برای استفاده در سایر قسمت‌ها
export const SERVER_URL = apiConfig.SERVER_URL;
export const API_URL = apiConfig.API_URL;

// ایجاد instance از axios
export const api = axios.create({
  baseURL: apiConfig.API_URL,
  ...apiConfig.config,
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
    return Promise.reject(error);
  },
);

// Response interceptor برای مدیریت خطاها
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {


    // مدیریت خطای 401 (Unauthorized)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || "";

      // لیست endpoint های عمومی که نیاز به authentication ندارند
      const publicEndpoints = [
        "/Home/",
        "/HeroSlides/",
        "/SuccessStories/",
        "/Courses/public",
        "/Categories/public",
        "/Blog/",
        "/auth/login",
        "/auth/register",
        "/health-check",
      ];

      // چک کنیم آیا این یک endpoint عمومی است
      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        requestUrl.includes(endpoint),
      );

      // چک کنیم آیا توکن ارسال شده بود (یعنی کاربر قصد دسترسی به منابع محافظت شده را داشت)
      const hasAuthToken = error.config?.headers?.Authorization;

      // فقط redirect کن اگر:
      // 1. در صفحات auth نیستیم
      // 2. این یک endpoint عمومی نیست
      // 3. توکن ارسال شده بود (یعنی کاربر لاگین بود اما توکنش منقضی شده)
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register") &&
        !isPublicEndpoint &&
        hasAuthToken
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect به صفحه login
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }


    return Promise.reject(error);
  },
);

/**
 * 🎯 API Wrapper با مدیریت خودکار Alert ها
 * این کلاس تمام درخواست‌های API را مدیریت می‌کند
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
      // Extract axios config from options (params, timeout, etc.)
      const { params, timeout, ...apiOptions } = options;
      const axiosConfig = {};
      if (params) axiosConfig.params = params;
      if (timeout) axiosConfig.timeout = timeout;

      const response = await api.get(
        url,
        Object.keys(axiosConfig).length > 0 ? axiosConfig : undefined,
      );
      return this._handleSuccess(response, {
        showSuccessAlert: false, // GET معمولاً نیاز به success alert ندارد
        ...apiOptions,
      });
    } catch (error) {
      return this._handleError(error, options);
    }
  }

  async post(url, data, options = {}) {
    try {
      // Extract axios config from options (headers, timeout, etc.)
      const { headers, timeout, ...apiOptions } = options;
      const axiosConfig = {};
      if (headers) axiosConfig.headers = headers;
      if (timeout) axiosConfig.timeout = timeout;

      const response = await api.post(
        url,
        data,
        Object.keys(axiosConfig).length > 0 ? axiosConfig : undefined,
      );
      return this._handleSuccess(response, apiOptions);
    } catch (error) {
      return this._handleError(error, options);
    }
  }

  async put(url, data, options = {}) {
    try {
      // Extract axios config from options (headers, timeout, etc.)
      const { headers, timeout, ...apiOptions } = options;
      const axiosConfig = {};
      if (headers) axiosConfig.headers = headers;
      if (timeout) axiosConfig.timeout = timeout;

      const response = await api.put(
        url,
        data,
        Object.keys(axiosConfig).length > 0 ? axiosConfig : undefined,
      );
      return this._handleSuccess(response, apiOptions);
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

/**
 * 🔧 ابزارهای مدیریت API
 */
export const ApiManager = {
  /**
   * تغییر آدرس API در runtime
   */
  setApiUrl: (newUrl) => apiConfig.setApiUrl(newUrl),

  /**
   * دریافت تنظیمات فعلی
   */
  getConfig: () => apiConfig.getCurrentConfig(),

  /**
   * تغییر timeout
   */
  setTimeout: (timeout) => apiConfig.setTimeout(timeout),

  /**
   * اضافه کردن header سراسری
   */
  setGlobalHeader: (key, value) => apiConfig.setGlobalHeader(key, value),

  /**
   * اجباری تنظیم به production API
   */
  forceProduction: () => apiConfig.forceProductionApi(),

  /**
   * تست اتصال به API
   */
  async testConnection() {
    try {
      const response = await api.get("/health-check");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },


};

// Export default برای استفاده راحت‌تر
export default api;
