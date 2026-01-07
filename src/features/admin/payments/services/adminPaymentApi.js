import { api } from "../../../../services/api";

export class AdminPaymentApi {
  /**
   * Fetch all admin payments (pending and processed)
   */
  static async listPayments() {
    const response = await api.get("/admin/payments");
    return response.data?.data?.data || [];
  }

  /**
   * Approve a payment
   */
  static async approvePayment(paymentAttemptId) {
    const response = await api.post(
      `/admin/payments/${paymentAttemptId}/approve`
    );
    return response.data;
  }

  /**
   * Reject a payment with reason
   */
  static async rejectPayment(paymentAttemptId, reason) {
    const response = await api.post(
      `/admin/payments/${paymentAttemptId}/reject`,
      {
        reason,
      }
    );
    return response.data;
  }
}
