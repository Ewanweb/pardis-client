/**
 * Alert Service - مدیریت مرکزی تمام Alert ها
 * معماری: Singleton Pattern + Observer Pattern
 */

class AlertService {
  constructor() {
    this.alerts = new Map();
    this.observers = [];
    this.config = {
      duration: {
        success: 4000,
        error: 6000,
        warning: 5000,
        info: 4000,
      },
      position: "top-right",
      maxAlerts: 5,
    };
  }

  /**
   * نمایش Alert موفقیت
   */
  success(message, options = {}) {
    return this._showAlert("success", message, options);
  }

  /**
   * نمایش Alert خطا
   */
  error(message, options = {}) {
    return this._showAlert("error", message, options);
  }

  /**
   * نمایش Alert هشدار
   */
  warning(message, options = {}) {
    return this._showAlert("warning", message, options);
  }

  /**
   * نمایش Alert اطلاعات
   */
  info(message, options = {}) {
    return this._showAlert("info", message, options);
  }

  /**
   * نمایش Alert سفارشی
   */
  custom(type, message, options = {}) {
    return this._showAlert(type, message, options);
  }

  /**
   * حذف Alert خاص
   */
  dismiss(alertId) {
    if (this.alerts.has(alertId)) {
      this.alerts.delete(alertId);
      this._notifyObservers("dismiss", alertId);
    }
  }

  /**
   * حذف همه Alert ها
   */
  dismissAll() {
    this.alerts.clear();
    this._notifyObservers("dismissAll");
  }

  /**
   * اضافه کردن Observer
   */
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== callback);
    };
  }

  /**
   * تنظیم کانفیگ
   */
  configure(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * دریافت همه Alert های فعال
   */
  getActiveAlerts() {
    return Array.from(this.alerts.values());
  }

  // Private Methods
  _showAlert(type, message, options) {
    const alertId = this._generateId();
    const duration = options.duration ?? this.config.duration[type] ?? 4000;

    const alert = {
      id: alertId,
      type,
      message,
      timestamp: Date.now(),
      duration,
      persistent: options.persistent || false,
      actions: options.actions || [],
      icon: options.icon,
      title: options.title,
      closable: options.closable !== false,
    };

    // محدود کردن تعداد Alert ها
    if (this.alerts.size >= this.config.maxAlerts) {
      const oldestAlert = Array.from(this.alerts.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      )[0];
      this.dismiss(oldestAlert.id);
    }

    this.alerts.set(alertId, alert);
    this._notifyObservers("show", alert);

    // حذف خودکار (اگر persistent نباشد)
    if (!alert.persistent && duration > 0) {
      setTimeout(() => {
        this.dismiss(alertId);
      }, duration);
    }

    return alertId;
  }

  _generateId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _notifyObservers(action, data) {
    this.observers.forEach((callback) => {
      try {
        callback(action, data);
      } catch (error) {
        console.error("Alert Observer Error:", error);
      }
    });
  }
}

// Singleton Instance
const alertService = new AlertService();

export default alertService;
