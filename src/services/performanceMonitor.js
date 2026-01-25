/**
 * 📊 سرویس نظارت بر عملکرد سیستم سبد خرید و سفارش‌ها
 *
 * این سرویس عملکرد عملیات مختلف را رصد کرده و گزارش‌های مفیدی ارائه می‌دهد
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      addToCart: 2000, // 2 seconds
      loadCart: 1500, // 1.5 seconds
      checkout: 5000, // 5 seconds
      loadOrders: 3000, // 3 seconds
    };
    this.isEnabled =
      process.env.NODE_ENV === "development" ||
      localStorage.getItem("enablePerformanceMonitoring") === "true";
  }

  /**
   * شروع اندازه‌گیری عملکرد
   * @param {string} operationName - نام عملیات
   * @param {Object} metadata - اطلاعات اضافی
   * @returns {string} شناسه اندازه‌گیری
   */
  startMeasurement(operationName, metadata = {}) {
    if (!this.isEnabled) return null;

    const measurementId = `${operationName}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const measurement = {
      id: measurementId,
      operationName,
      startTime: performance.now(),
      startTimestamp: new Date().toISOString(),
      metadata,
      status: "running",
    };

    this.metrics.set(measurementId, measurement);

    console.log(`🚀 Performance: Started measuring "${operationName}"`, {
      measurementId,
      metadata,
    });

    return measurementId;
  }

  /**
   * پایان اندازه‌گیری عملکرد
   * @param {string} measurementId - شناسه اندازه‌گیری
   * @param {Object} result - نتیجه عملیات
   * @returns {Object} گزارش عملکرد
   */
  endMeasurement(measurementId, result = {}) {
    if (!this.isEnabled || !measurementId) return null;

    const measurement = this.metrics.get(measurementId);
    if (!measurement) {
      console.warn(`⚠️ Performance: Measurement not found: ${measurementId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    measurement.endTime = endTime;
    measurement.duration = duration;
    measurement.endTimestamp = new Date().toISOString();
    measurement.result = result;
    measurement.status = result.success ? "success" : "error";

    // بررسی آستانه عملکرد
    const threshold = this.thresholds[measurement.operationName];
    measurement.isSlowOperation = threshold && duration > threshold;

    // ایجاد گزارش
    const report = this.generateReport(measurement);

    // لاگ کردن نتیجه
    if (measurement.isSlowOperation) {
      console.warn(`🐌 Performance: Slow operation detected`, report);
    } else if (measurement.status === "error") {
      console.error(`❌ Performance: Operation failed`, report);
    } else {
      console.log(`✅ Performance: Operation completed`, report);
    }

    // ذخیره در تاریخچه (فقط 100 آخرین مورد)
    this.saveToHistory(measurement);

    return report;
  }

  /**
   * اندازه‌گیری عملکرد API
   * @param {string} endpoint - آدرس API
   * @param {string} method - متد HTTP
   * @param {Object} requestData - داده‌های درخواست
   * @returns {string} شناسه اندازه‌گیری
   */
  measureApiCall(endpoint, method = "GET", requestData = {}) {
    return this.startMeasurement("api_call", {
      endpoint,
      method,
      requestSize: JSON.stringify(requestData).length,
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType || "unknown",
    });
  }

  /**
   * اندازه‌گیری عملکرد رندر کامپوننت
   * @param {string} componentName - نام کامپوننت
   * @param {Object} props - props کامپوننت
   * @returns {string} شناسه اندازه‌گیری
   */
  measureComponentRender(componentName, props = {}) {
    return this.startMeasurement("component_render", {
      componentName,
      propsCount: Object.keys(props).length,
      hasComplexProps: this.hasComplexProps(props),
    });
  }

  /**
   * اندازه‌گیری عملکرد عملیات سبد خرید
   * @param {string} operation - نوع عملیات (add, remove, clear, checkout)
   * @param {Object} cartData - اطلاعات سبد خرید
   * @returns {string} شناسه اندازه‌گیری
   */
  measureCartOperation(operation, cartData = {}) {
    return this.startMeasurement(`cart_${operation}`, {
      operation,
      itemCount: cartData.itemCount || 0,
      totalAmount: cartData.totalAmount || 0,
      isExpired: cartData.isExpired || false,
    });
  }

  /**
   * تولید گزارش عملکرد
   * @param {Object} measurement - اطلاعات اندازه‌گیری
   * @returns {Object} گزارش
   */
  generateReport(measurement) {
    return {
      id: measurement.id,
      operation: measurement.operationName,
      duration: Math.round(measurement.duration),
      status: measurement.status,
      isSlowOperation: measurement.isSlowOperation,
      threshold: this.thresholds[measurement.operationName],
      startTime: measurement.startTimestamp,
      endTime: measurement.endTimestamp,
      metadata: measurement.metadata,
      result: measurement.result,
      performance: {
        rating: this.getPerformanceRating(
          measurement.duration,
          measurement.operationName
        ),
        category: this.getPerformanceCategory(
          measurement.duration,
          measurement.operationName
        ),
      },
    };
  }

  /**
   * دریافت رتبه عملکرد
   * @param {number} duration - مدت زمان (میلی‌ثانیه)
   * @param {string} operationName - نام عملیات
   * @returns {string} رتبه عملکرد
   */
  getPerformanceRating(duration, operationName) {
    const threshold = this.thresholds[operationName] || 2000;

    if (duration < threshold * 0.3) return "excellent";
    if (duration < threshold * 0.6) return "good";
    if (duration < threshold) return "acceptable";
    if (duration < threshold * 1.5) return "slow";
    return "very_slow";
  }

  /**
   * دریافت دسته‌بندی عملکرد
   * @param {number} duration - مدت زمان
   * @param {string} operationName - نام عملیات
   * @returns {string} دسته‌بندی
   */
  getPerformanceCategory(duration, operationName) {
    const rating = this.getPerformanceRating(duration, operationName);

    switch (rating) {
      case "excellent":
      case "good":
        return "optimal";
      case "acceptable":
        return "normal";
      case "slow":
        return "needs_attention";
      case "very_slow":
        return "critical";
      default:
        return "unknown";
    }
  }

  /**
   * ذخیره در تاریخچه
   * @param {Object} measurement - اطلاعات اندازه‌گیری
   */
  saveToHistory(measurement) {
    try {
      const history = JSON.parse(
        localStorage.getItem("performanceHistory") || "[]"
      );
      history.push({
        id: measurement.id,
        operation: measurement.operationName,
        duration: measurement.duration,
        status: measurement.status,
        timestamp: measurement.endTimestamp,
        isSlowOperation: measurement.isSlowOperation,
      });

      // نگه داشتن فقط 100 مورد آخر
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      localStorage.setItem("performanceHistory", JSON.stringify(history));
    } catch (error) {
      console.warn("Failed to save performance history:", error);
    }
  }

  /**
   * دریافت آمار عملکرد
   * @param {string} operationName - نام عملیات (اختیاری)
   * @returns {Object} آمار عملکرد
   */
  getPerformanceStats(operationName = null) {
    try {
      const history = JSON.parse(
        localStorage.getItem("performanceHistory") || "[]"
      );
      let filteredHistory = history;

      if (operationName) {
        filteredHistory = history.filter(
          (item) => item.operation === operationName
        );
      }

      if (filteredHistory.length === 0) {
        return { message: "No performance data available" };
      }

      const durations = filteredHistory.map((item) => item.duration);
      const successCount = filteredHistory.filter(
        (item) => item.status === "success"
      ).length;
      const slowOperationsCount = filteredHistory.filter(
        (item) => item.isSlowOperation
      ).length;

      return {
        totalOperations: filteredHistory.length,
        successRate: Math.round((successCount / filteredHistory.length) * 100),
        slowOperationsRate: Math.round(
          (slowOperationsCount / filteredHistory.length) * 100
        ),
        averageDuration: Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length
        ),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        medianDuration: this.calculateMedian(durations),
        recentOperations: filteredHistory.slice(-10),
      };
    } catch (error) {
      console.warn("Failed to get performance stats:", error);
      return { error: "Failed to calculate stats" };
    }
  }

  /**
   * محاسبه میانه
   * @param {Array} numbers - آرایه اعداد
   * @returns {number} میانه
   */
  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
    }

    return sorted[middle];
  }

  /**
   * بررسی پیچیدگی props
   * @param {Object} props - props کامپوننت
   * @returns {boolean} آیا props پیچیده است؟
   */
  hasComplexProps(props) {
    try {
      const jsonString = JSON.stringify(props);
      return (
        jsonString.length > 1000 ||
        Object.values(props).some(
          (value) =>
            (Array.isArray(value) && value.length > 10) ||
            (typeof value === "object" &&
              value !== null &&
              Object.keys(value).length > 5)
        )
      );
    } catch {
      return true; // اگر نتوان serialize کرد، پیچیده در نظر گرفته می‌شود
    }
  }

  /**
   * پاک کردن تاریخچه عملکرد
   */
  clearHistory() {
    localStorage.removeItem("performanceHistory");
    this.metrics.clear();
    console.log("🧹 Performance history cleared");
  }

  /**
   * فعال/غیرفعال کردن نظارت بر عملکرد
   * @param {boolean} enabled - وضعیت فعال/غیرفعال
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem("enablePerformanceMonitoring", enabled.toString());
    console.log(
      `📊 Performance monitoring ${enabled ? "enabled" : "disabled"}`
    );
  }

  /**
   * دریافت گزارش کامل عملکرد
   * @returns {Object} گزارش کامل
   */
  getFullReport() {
    const stats = this.getPerformanceStats();
    const cartStats = this.getPerformanceStats("cart_add");
    const apiStats = this.getPerformanceStats("api_call");

    return {
      overall: stats,
      cartOperations: cartStats,
      apiCalls: apiStats,
      systemInfo: {
        userAgent: navigator.userAgent,
        connectionType: navigator.connection?.effectiveType || "unknown",
        deviceMemory: navigator.deviceMemory || "unknown",
        hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
      },
      thresholds: this.thresholds,
      isEnabled: this.isEnabled,
    };
  }
}

// ایجاد instance سراسری
const performanceMonitor = new PerformanceMonitor();

// هوک React برای استفاده آسان
export const usePerformanceMonitor = () => {
  return {
    startMeasurement: (operation, metadata) =>
      performanceMonitor.startMeasurement(operation, metadata),
    endMeasurement: (id, result) =>
      performanceMonitor.endMeasurement(id, result),
    measureApiCall: (endpoint, method, data) =>
      performanceMonitor.measureApiCall(endpoint, method, data),
    measureComponentRender: (name, props) =>
      performanceMonitor.measureComponentRender(name, props),
    measureCartOperation: (operation, data) =>
      performanceMonitor.measureCartOperation(operation, data),
    getStats: (operation) => performanceMonitor.getPerformanceStats(operation),
    getFullReport: () => performanceMonitor.getFullReport(),
    clearHistory: () => performanceMonitor.clearHistory(),
    setEnabled: (enabled) => performanceMonitor.setEnabled(enabled),
  };
};

export default performanceMonitor;
