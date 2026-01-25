import React, { useState, useCallback } from "react";
import { profileApi } from "../services/profileApi";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook for managing user profile operations
 */
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchUser } = useAuth();

  /**
   * Get user profile
   */
  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileApi.getProfile();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || "خطا در دریافت اطلاعات پروفایل");
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "خطا در دریافت اطلاعات پروفایل";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await profileApi.updateProfile(profileData);

        if (response.success) {
          // Update auth context user data
          await fetchUser();
          return { success: true, data: response.data };
        } else {
          setError(response.message || "خطا در به‌روزرسانی پروفایل");
          return { success: false, message: response.message };
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "خطا در به‌روزرسانی پروفایل";
        setError(errorMessage);
        console.error("Error updating profile:", err);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [fetchUser]
  );

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(
    async (avatarFile) => {
      try {
        setUploading(true);
        setError(null);

        const response = await profileApi.uploadAvatar(avatarFile);

        if (response.success) {
          // Update auth context user data
          await fetchUser();
          return { success: true, data: response.data };
        } else {
          setError(response.message || "خطا در آپلود آواتار");
          return { success: false, message: response.message };
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "خطا در آپلود آواتار";
        setError(errorMessage);
        console.error("Error uploading avatar:", err);
        return { success: false, message: errorMessage };
      } finally {
        setUploading(false);
      }
    },
    [fetchUser]
  );

  /**
   * Delete avatar
   */
  const deleteAvatar = useCallback(async () => {
    try {
      setUploading(true);
      setError(null);

      const response = await profileApi.deleteAvatar();

      if (response.success) {
        // Update auth context user data
        await fetchUser();
        return { success: true, data: response.data };
      } else {
        setError(response.message || "خطا در حذف آواتار");
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "خطا در حذف آواتار";
      setError(errorMessage);
      console.error("Error deleting avatar:", err);
      return { success: false, message: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [fetchUser]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    uploading,
    error,
    getProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    clearError,
  };
};
