import { apiClient } from "../../../../services/api";

export const ConsultationAdminApi = {
  /**
   * دریافت لیست درخواست‌های مشاوره
   */
  getConsultations: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.pageSize) queryParams.append("pageSize", params.pageSize);
    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", params.status);
    }
    if (params.search) queryParams.append("search", params.search);

    const url = `/admin/consultations${queryParams.toString() ? `?${queryParams}` : ""}`;
    console.log("🔗 API Request URL:", url);

    const response = await apiClient.get(url);
    return response;
  },

  /**
   * به‌روزرسانی وضعیت درخواست
   */
  updateStatus: async (id, status, adminNotes = null) => {
    const response = await apiClient.put(
      `/admin/consultations/${id}/status`,
      {
        status,
        adminNotes,
      },
      {
        successMessage: "وضعیت درخواست به‌روزرسانی شد",
      },
    );
    return response;
  },

  /**
   * حذف درخواست مشاوره
   */
  deleteConsultation: async (id) => {
    const response = await apiClient.delete(`/admin/consultations/${id}`, {
      successMessage: "درخواست مشاوره حذف شد",
    });
    return response;
  },
};
