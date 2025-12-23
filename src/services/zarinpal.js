// import { api } from "./api"; // Not used currently
// ZarinPal Test Configuration
const ZARINPAL_CONFIG = {
  // Sandbox (Test) URLs
  SANDBOX_GATEWAY: "https://sandbox.zarinpal.com/pg/StartPay/",
  SANDBOX_REQUEST:
    "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
  SANDBOX_VERIFY:
    "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json",
  // Test Merchant ID (provided by ZarinPal for testing)
  TEST_MERCHANT_ID: "00000000-0000-0000-0000-000000000000",
  // Callback URL (where user returns after payment)
  CALLBACK_URL: `${window.location.origin}/payment/callback`,
};
/**
 * Start payment process with ZarinPal
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Amount in Tomans
 * @param {string} paymentData.description - Payment description
 * @param {string} paymentData.email - User email (optional)
 * @param {string} paymentData.mobile - User mobile (optional)
 * @returns {Promise<string>} - Payment gateway URL
 */
export const startZarinpalPayment = async (paymentData) => {
  try {
    const { amount, description, email = "", mobile = "" } = paymentData;
    // Convert amount to Rials (ZarinPal uses Rials, we use Tomans)
    const amountInRials = amount * 10;
    const requestData = {
      MerchantID: ZARINPAL_CONFIG.TEST_MERCHANT_ID,
      Amount: amountInRials,
      Description: description,
      Email: email,
      Mobile: mobile,
      CallbackURL: ZARINPAL_CONFIG.CALLBACK_URL,
    };
    // Make request to ZarinPal
    const response = await fetch(ZARINPAL_CONFIG.SANDBOX_REQUEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    const result = await response.json();
    if (result.Status === 100) {
      // Success - redirect to payment gateway
      const gatewayUrl = `${ZARINPAL_CONFIG.SANDBOX_GATEWAY}${result.Authority}`;
      return {
        success: true,
        authority: result.Authority,
        gatewayUrl: gatewayUrl,
      };
    } else {
      throw new Error(
        `ZarinPal Error: ${result.Status} - ${getZarinpalErrorMessage(
          result.Status
        )}`
      );
    }
  } catch (error) {
    console.error("ZarinPal Payment Error:", error);
    throw error;
  }
};
/**
 * Verify payment with ZarinPal
 * @param {string} authority - Payment authority from callback
 * @param {number} amount - Original amount in Tomans
 * @returns {Promise<Object>} - Verification result
 */
export const verifyZarinpalPayment = async (authority, amount) => {
  try {
    const amountInRials = amount * 10;
    const verifyData = {
      MerchantID: ZARINPAL_CONFIG.TEST_MERCHANT_ID,
      Amount: amountInRials,
      Authority: authority,
    };
    const response = await fetch(ZARINPAL_CONFIG.SANDBOX_VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyData),
    });
    const result = await response.json();
    if (result.Status === 100 || result.Status === 101) {
      return {
        success: true,
        refId: result.RefID,
        status: result.Status,
      };
    } else {
      return {
        success: false,
        status: result.Status,
        message: getZarinpalErrorMessage(result.Status),
      };
    }
  } catch (error) {
    console.error("ZarinPal Verify Error:", error);
    throw error;
  }
};
/**
 * Get error message for ZarinPal status codes
 * @param {number} status - Status code
 * @returns {string} - Error message in Persian
 */
const getZarinpalErrorMessage = (status) => {
  const errorMessages = {
    "-1": "اطلاعات ارسال شده ناقص است",
    "-2": "IP یا مرچنت کد پذیرنده صحیح نیست",
    "-3": "با توجه به محدودیت‌های شاپرک امکان پردازش وجود ندارد",
    "-4": "سطح تأیید پذیرنده پایین‌تر از سطح نقره‌ای است",
    "-11": "درخواست مورد نظر یافت نشد",
    "-12": "امکان ویرایش درخواست میسر نمی‌باشد",
    "-21": "هیچ نوع عملیات مالی برای این تراکنش یافت نشد",
    "-22": "تراکنش ناموفق بوده است",
    "-33": "رقم تراکنش با رقم پرداخت شده مطابقت ندارد",
    "-34": "سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور نموده است",
    "-40": "اجازه دسترسی به متد مربوطه وجود ندارد",
    "-41": "اطلاعات ارسال شده مربوط به AdditionalData غیرمعتبر می‌باشد",
    "-42":
      "مدت زمان معتبر طول عمر شناسه پرداخت بایستی بین 30 دقیقه تا 45 روز مشخص گردد",
    "-54": "درخواست مورد نظر آرشیو شده است",
    101: "عملیات پرداخت موفق بوده و قبلا PaymentVerification تراکنش انجام شده است",
  };
  return errorMessages[status.toString()] || `خطای ناشناخته: ${status}`;
};
/**
 * Simulate payment for testing (without actual ZarinPal)
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Simulated result
 */
export const simulatePayment = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Simulate random success/failure for testing
  const isSuccess = Math.random() > 0.1; // 90% success rate
  if (isSuccess) {
    return {
      success: true,
      authority: `TEST_${Date.now()}`,
      refId: Math.floor(Math.random() * 1000000),
      message: "پرداخت تستی موفق بود",
    };
  } else {
    throw new Error("پرداخت تستی ناموفق بود (شبیه‌سازی خطا)");
  }
};
export default {
  startZarinpalPayment,
  verifyZarinpalPayment,
  simulatePayment,
  ZARINPAL_CONFIG,
};
