import React, { useState, useEffect, useCallback } from "react";
import { CourseService } from "../services/courseService";
import { useAlert } from "./useAlert";
import { useAuth } from "../context/AuthContext";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    upcoming: 0,
    totalHours: 0,
    certificates: 0,
  });

  const alert = useAlert();
  const { user } = useAuth();

  const fetchMyCourses = useCallback(async () => {
    if (!user || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await CourseService.getMyEnrollments();

      if (result.success) {
        setCourses(result.data);
        setStats(CourseService.calculateStats(result.data));
      } else {
        setError(result.error);
        setCourses([]);
        // Using alert reference is now safe as it's memoized
        alert.showError(result.message);
      }
    } catch (err) {
      console.error("Error in fetchMyCourses:", err);
      setError("UNEXPECTED_ERROR");
      setCourses([]);
    } finally {
      setLoading(false);
    }
    // Using user?.id instead of user object for maximum stability
  }, [user?.id, alert]);

  const checkEnrollmentStatus = useCallback(
    async (courseId) => {
      if (!user?.id || !courseId) return null;
      return await CourseService.getEnrollmentStatus(courseId);
    },
    [user?.id]
  );

  const refreshCourses = useCallback(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const getCategorizedCourses = useCallback(() => {
    return CourseService.categorizeCourses(courses);
  }, [courses]);

  useEffect(() => {
    if (user?.id) {
      fetchMyCourses();
    }
  }, [fetchMyCourses, user?.id]);

  return {
    courses,
    stats,
    loading,
    error,
    fetchMyCourses,
    refreshCourses,
    checkEnrollmentStatus,
    getCategorizedCourses,
    hasError: !!error,
    isEmpty: courses.length === 0,
    isLoaded: !loading && !error,
  };
};

export default useCourses;
