import { api } from "../../../../services/api";

/**
 * Generate a unique idempotency key (UUID v4)
 */
function generateIdempotencyKey() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class AdminPaymentApi {
  /**
   * Fetch all admin payments (pending and processed)
   */
  static async listPayments(options) {
    const isLegacy = !options;
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const search = options?.search ?? "";
    const status = options?.status ?? "all";

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append("search", search);
    if (status !== "all") params.append("status", status.toString());

    const response = await api.get(`/admin/payments?${params}`);
    const result = response.data?.data?.data;

    if (isLegacy) {
      return Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result)
          ? result
          : [];
    }

    return {
      items: Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result)
          ? result
          : [],
      pagination: {
        page: result?.page ?? page,
        pageSize: result?.pageSize ?? pageSize,
        totalCount: result?.totalCount ?? 0,
        totalPages: result?.totalPages ?? 1,
        hasNext: result?.hasNext ?? false,
        hasPrev: result?.hasPrev ?? false,
      },
      stats: result?.stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    };
  }

  /**
   * Approve a payment
   */
  static async approvePayment(paymentAttemptId, adminNote = null) {
    const idempotencyKey = generateIdempotencyKey();
    const response = await api.post(
      `/admin/payments/${paymentAttemptId}/approve`,
      {
        isApproved: true,
        adminNote: adminNote,
        rejectionReason: null,
        approvedAmount: null,
      },
      {
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      },
    );
    return response.data;
  }

  /**
   * Reject a payment with reason
   */
  static async rejectPayment(paymentAttemptId, reason) {
    const idempotencyKey = generateIdempotencyKey();
    const response = await api.post(
      `/admin/payments/${paymentAttemptId}/reject`,
      {
        reason,
      },
      {
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      },
    );
    return response.data;
  }
}
