import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { requestCache } from "../utils/requestCache";

export const useHomeData = (categoryId = null) => {
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // 1. Fetch critical data first (categories & instructors) - these are cached
  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        const [categoriesRes, instructorsRes] = await Promise.all([
          requestCache.get("/Home/Categories", { ttl: 86400000 }),
          requestCache.get("/Home/Instructors", { ttl: 86400000 }),
        ]);

        // Handle different response structures
        const categoriesData =
          categoriesRes?.data?.data ||
          categoriesRes?.data ||
          categoriesRes ||
          [];
        const instructorsData =
          instructorsRes?.data?.data ||
          instructorsRes?.data ||
          instructorsRes ||
          [];

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
        setLoading(false); // ✅ Allow page to render with critical data
      } catch (error) {
        console.error("Critical data error:", error);
        setCategories([]);
        setInstructors([]);
        setLoading(false);
      }
    };

    fetchCriticalData();
  }, []);

  // 2. Fetch courses independently (can be slower)
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        let url = "/Home/Courses?page=1&pageSize=12";
        if (categoryId) {
          url += `&categoryId=${categoryId}`;
        }

        const response = await api.get(url);
        const data = response.data?.data || response.data || [];
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Courses error:", error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [categoryId]);

  // 3. Fetch non-critical data in background (slides & stories)
  useEffect(() => {
    const fetchNonCriticalData = async () => {
      try {
        const [slidesRes, storiesRes] = await Promise.all([
          api.get("/HeroSlides/active").catch(() => ({ data: { data: [] } })),
          api
            .get("/SuccessStories/active")
            .catch(() => ({ data: { data: [] } })),
        ]);

        const slidesData = slidesRes.data?.data || slidesRes.data || [];
        const storiesData = storiesRes.data?.data || storiesRes.data || [];

        setHeroSlides(Array.isArray(slidesData) ? slidesData : []);
        setFeaturedStories(Array.isArray(storiesData) ? storiesData : []);
      } catch (error) {
        console.error("Non-critical data error:", error);
      }
    };

    // Delay non-critical data to prioritize critical rendering
    const timer = setTimeout(fetchNonCriticalData, 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    categories,
    instructors,
    courses,
    heroSlides,
    featuredStories,
    loading, // Only true while fetching critical data
    coursesLoading,
  };
};
