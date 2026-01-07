/**
 * Single source of truth for payment status values and labels
 * Based on backend PaymentAttemptStatus enum
 */

export const PaymentStatus = {
  DRAFT: 0, // Draft - پیش‌نویس
  PENDING_PAYMENT: 1, // PendingPayment - در انتظار پرداخت
  AWAITING_ADMIN_APPROVAL: 3, // AwaitingAdminApproval - در انتظار تایید ادمین
  PAID: 4, // Paid - پرداخت شده
  FAILED: 5, // Failed - ناموفق
};

// Map string status from backend to numeric values
export const STATUS_STRING_TO_NUMBER = {
  Draft: PaymentStatus.DRAFT,
  PendingPayment: PaymentStatus.PENDING_PAYMENT,
  AwaitingAdminApproval: PaymentStatus.AWAITING_ADMIN_APPROVAL,
  Paid: PaymentStatus.PAID,
  Failed: PaymentStatus.FAILED,
};

// Helper function to convert backend status to numeric
export const getStatusNumber = (status) => {
  if (typeof status === "number") return status;
  if (typeof status === "string")
    return STATUS_STRING_TO_NUMBER[status] ?? PaymentStatus.DRAFT;
  return PaymentStatus.DRAFT;
};

export const PAYMENT_STATUS_LABELS = {
  [PaymentStatus.DRAFT]: "پیش‌نویس",
  [PaymentStatus.PENDING_PAYMENT]: "در انتظار پرداخت",
  [PaymentStatus.AWAITING_ADMIN_APPROVAL]: "در انتظار تایید ادمین",
  [PaymentStatus.PAID]: "پرداخت شده",
  [PaymentStatus.FAILED]: "ناموفق",
};

export const PAYMENT_STATUS_STYLES = {
  [PaymentStatus.DRAFT]:
    "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
  [PaymentStatus.PENDING_PAYMENT]:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  [PaymentStatus.AWAITING_ADMIN_APPROVAL]:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  [PaymentStatus.PAID]:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  [PaymentStatus.FAILED]:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

export const FILTER_OPTIONS = [
  { value: "all", label: "همه پرداخت‌ها" },
  {
    value: PaymentStatus.AWAITING_ADMIN_APPROVAL.toString(),
    label: "در انتظار تایید ادمین",
  },
  {
    value: PaymentStatus.PENDING_PAYMENT.toString(),
    label: "در انتظار پرداخت",
  },
  { value: PaymentStatus.PAID.toString(), label: "پرداخت شده" },
  { value: PaymentStatus.FAILED.toString(), label: "ناموفق" },
  { value: PaymentStatus.DRAFT.toString(), label: "پیش‌نویس" },
];

/**
 * Helper functions for payment status
 */
export const isPaymentPending = (status) => {
  const numericStatus = getStatusNumber(status);
  return numericStatus === PaymentStatus.AWAITING_ADMIN_APPROVAL;
};

export const canApproveOrReject = (status) => {
  const numericStatus = getStatusNumber(status);
  return numericStatus === PaymentStatus.AWAITING_ADMIN_APPROVAL;
};

export const isPaymentCompleted = (status) => {
  const numericStatus = getStatusNumber(status);
  return numericStatus === PaymentStatus.PAID;
};

export const isPaymentFailed = (status) => {
  const numericStatus = getStatusNumber(status);
  return numericStatus === PaymentStatus.FAILED;
};
