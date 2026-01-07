import { api } from "./api";

/**
 * Profile API Service
 * Handles all profile-related API calls
 */
export const profileApi = {
  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await api.get("/my/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put("/my/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Upload user avatar
   * @param {File} avatarFile - Avatar image file
   */
  async uploadAvatar(avatarFile) {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await api.post("/my/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar() {
    try {
      const response = await api.delete("/my/profile/avatar");
      return response.data;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  },
};
