/**
 * Frontend Cart and Order Validation Service
 * Provides client-side validation for cart and order operations
 */

export class CartValidationService {
  /**
   * Validates cart data before checkout
   * @param {Object} cart - Cart object from API
   * @returns {Object} Validation result with isValid flag and errors
   */
  static validateCartForCheckout(cart) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check if cart exists
    if (!cart) {
      result.isValid = false;
      result.errors.push({
        code: "CART_EMPTY",
        message: "سبد خرید خالی است",
      });
      return result;
    }

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      result.isValid = false;
      result.errors.push({
        code: "CART_EMPTY",
        message: "سبد خرید خالی است",
      });
      return result;
    }

    // Check if cart is expired
    if (cart.isExpired) {
      result.isValid = false;
      result.errors.push({
        code: "CART_EXPIRED",
        message: "سبد خرید منقضی شده است. لطفاً دوره‌ها را مجدداً اضافه کنید",
      });
      return result;
    }

    // Check cart ID validity
    if (
      !cart.cartId ||
      cart.cartId === "00000000-0000-0000-0000-000000000000"
    ) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_CART_ID",
        message: "شناسه سبد خرید معتبر نیست",
      });
      return result;
    }

    // Validate individual cart items
    for (const item of cart.items) {
      const itemValidation = this.validateCartItem(item);
      if (!itemValidation.isValid) {
        result.isValid = false;
        result.errors.push(...itemValidation.errors);
      }
      result.warnings.push(...itemValidation.warnings);
    }

    // Check for expiry warning (within 24 hours)
    if (cart.expiresAt) {
      const expiryDate = new Date(cart.expiresAt);
      const now = new Date();
      const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);

      if (hoursUntilExpiry <= 24 && hoursUntilExpiry > 0) {
        result.warnings.push({
          code: "CART_EXPIRING_SOON",
          message: `سبد خرید شما در ${Math.round(
            hoursUntilExpiry
          )} ساعت منقضی می‌شود`,
        });
      }
    }

    return result;
  }

  /**
   * Validates individual cart item
   * @param {Object} item - Cart item object
   * @returns {Object} Validation result
   */
  static validateCartItem(item) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check required fields
    if (!item.courseId) {
      result.isValid = false;
      result.errors.push({
        code: "MISSING_COURSE_ID",
        message: "شناسه دوره مشخص نیست",
      });
    }

    if (!item.title || item.title.trim() === "") {
      result.isValid = false;
      result.errors.push({
        code: "MISSING_COURSE_TITLE",
        message: "عنوان دوره مشخص نیست",
      });
    }

    if (item.unitPrice < 0) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_PRICE",
        message: "قیمت دوره نامعتبر است",
      });
    }

    // Check for missing thumbnail (warning only)
    if (!item.thumbnail || item.thumbnail.trim() === "") {
      result.warnings.push({
        code: "MISSING_THUMBNAIL",
        message: "تصویر دوره موجود نیست",
      });
    }

    // Check for missing instructor (warning only)
    if (
      !item.instructor ||
      item.instructor.trim() === "" ||
      item.instructor === "نامشخص"
    ) {
      result.warnings.push({
        code: "MISSING_INSTRUCTOR",
        message: "اطلاعات مدرس دوره موجود نیست",
      });
    }

    return result;
  }

  /**
   * Validates course data before adding to cart
   * @param {Object} course - Course object
   * @returns {Object} Validation result
   */
  static validateCourseForCart(course) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!course) {
      result.isValid = false;
      result.errors.push({
        code: "COURSE_NOT_FOUND",
        message: "دوره مورد نظر یافت نشد",
      });
      return result;
    }

    // Check course status
    if (course.status !== "Published") {
      result.isValid = false;
      result.errors.push({
        code: "COURSE_INACTIVE",
        message: "این دوره در حال حاضر غیرفعال است",
      });
    }

    // Check required fields
    if (!course.id) {
      result.isValid = false;
      result.errors.push({
        code: "MISSING_COURSE_ID",
        message: "شناسه دوره مشخص نیست",
      });
    }

    if (!course.title || course.title.trim() === "") {
      result.isValid = false;
      result.errors.push({
        code: "MISSING_COURSE_TITLE",
        message: "عنوان دوره مشخص نیست",
      });
    }

    if (course.price < 0) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_PRICE",
        message: "قیمت دوره نامعتبر است",
      });
    }

    return result;
  }

  /**
   * Validates order data
   * @param {Object} order - Order object
   * @returns {Object} Validation result
   */
  static validateOrder(order) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!order) {
      result.isValid = false;
      result.errors.push({
        code: "ORDER_NOT_FOUND",
        message: "سفارش یافت نشد",
      });
      return result;
    }

    // Check order ID
    if (
      !order.orderId ||
      order.orderId === "00000000-0000-0000-0000-000000000000"
    ) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_ORDER_ID",
        message: "شناسه سفارش معتبر نیست",
      });
    }

    // Check order number
    if (!order.orderNumber || order.orderNumber.trim() === "") {
      result.isValid = false;
      result.errors.push({
        code: "MISSING_ORDER_NUMBER",
        message: "شماره سفارش مشخص نیست",
      });
    }

    // Check total amount
    if (order.totalAmount < 0) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_TOTAL_AMOUNT",
        message: "مبلغ کل سفارش نامعتبر است",
      });
    }

    // Validate payment attempts
    if (order.paymentAttempts && order.paymentAttempts.length > 0) {
      for (const attempt of order.paymentAttempts) {
        const attemptValidation = this.validatePaymentAttempt(attempt);
        if (!attemptValidation.isValid) {
          result.warnings.push(...attemptValidation.errors);
        }
      }
    }

    return result;
  }

  /**
   * Validates payment attempt data
   * @param {Object} attempt - Payment attempt object
   * @returns {Object} Validation result
   */
  static validatePaymentAttempt(attempt) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!attempt) {
      result.isValid = false;
      result.errors.push({
        code: "PAYMENT_ATTEMPT_NOT_FOUND",
        message: "تلاش پرداخت یافت نشد",
      });
      return result;
    }

    // Check payment attempt ID
    if (
      !attempt.paymentAttemptId ||
      attempt.paymentAttemptId === "00000000-0000-0000-0000-000000000000"
    ) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_PAYMENT_ATTEMPT_ID",
        message: "شناسه تلاش پرداخت معتبر نیست",
      });
    }

    // Check amount
    if (attempt.amount <= 0) {
      result.isValid = false;
      result.errors.push({
        code: "INVALID_PAYMENT_AMOUNT",
        message: "مبلغ پرداخت نامعتبر است",
      });
    }

    // Check tracking code
    if (!attempt.trackingCode || attempt.trackingCode.trim() === "") {
      result.warnings.push({
        code: "MISSING_TRACKING_CODE",
        message: "کد پیگیری پرداخت موجود نیست",
      });
    }

    return result;
  }

  /**
   * Gets user-friendly error message for error code
   * @param {string} errorCode - Error code
   * @returns {string} User-friendly message
   */
  static getErrorMessage(errorCode) {
    const errorMessages = {
      CART_EMPTY: "سبد خرید خالی است",
      CART_EXPIRED: "سبد خرید منقضی شده است",
      INVALID_CART_ID: "شناسه سبد خرید معتبر نیست",
      COURSE_NOT_FOUND: "دوره مورد نظر یافت نشد",
      COURSE_INACTIVE: "این دوره در حال حاضر غیرفعال است",
      ALREADY_ENROLLED: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
      ALREADY_IN_CART: "این دوره قبلاً به سبد خرید اضافه شده است",
      MISSING_COURSE_ID: "شناسه دوره مشخص نیست",
      MISSING_COURSE_TITLE: "عنوان دوره مشخص نیست",
      INVALID_PRICE: "قیمت نامعتبر است",
      ORDER_NOT_FOUND: "سفارش یافت نشد",
      INVALID_ORDER_ID: "شناسه سفارش معتبر نیست",
      MISSING_ORDER_NUMBER: "شماره سفارش مشخص نیست",
      INVALID_TOTAL_AMOUNT: "مبلغ کل نامعتبر است",
      PAYMENT_ATTEMPT_NOT_FOUND: "تلاش پرداخت یافت نشد",
      INVALID_PAYMENT_ATTEMPT_ID: "شناسه تلاش پرداخت معتبر نیست",
      INVALID_PAYMENT_AMOUNT: "مبلغ پرداخت نامعتبر است",
    };

    return errorMessages[errorCode] || "خطای نامشخص";
  }
}

export default CartValidationService;
