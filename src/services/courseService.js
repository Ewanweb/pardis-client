import { api } from "./api";

/**
 * سرویس مدیریت دوره‌ها
 */
export class CourseService {
  /**
   * دریافت دوره‌های ثبت‌نام شده کاربر فعلی
   * @returns {Promise<Array>} لیست دوره‌های ثبت‌نام شده
   */
  static async getMyEnrollments() {
    try {
      const response = await api.get("/courses/my-enrollments");
      return {
        success: true,
        data: response.data?.data || response.data || [],
        message: response.data?.message || "دوره‌ها با موفقیت دریافت شدند",
      };
    } catch (error) {
      console.error("Error fetching my enrollments:", error);

      // مدیریت انواع خطاها
      if (error.response?.status === 401) {
        return {
          success: false,
          error: "UNAUTHORIZED",
          message: "لطفاً مجدداً وارد شوید",
        };
      } else if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: "شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید",
        };
      } else {
        return {
          success: false,
          error: "FETCH_ERROR",
          message: "خطا در دریافت دوره‌ها. لطفاً مجدداً تلاش کنید",
        };
      }
    }
  }

  /**
   * بررسی وضعیت ثبت‌نام کاربر در یک دوره
   * @param {string} courseId شناسه دوره
   * @returns {Promise<Object>} وضعیت ثبت‌نام
   */
  static async getEnrollmentStatus(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/enrollment-status`);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || "وضعیت ثبت‌نام دریافت شد",
      };
    } catch (error) {
      console.error("Error fetching enrollment status:", error);

      if (error.response?.status === 401) {
        return {
          success: false,
          error: "UNAUTHORIZED",
          message: "لطفاً مجدداً وارد شوید",
        };
      } else if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            isEnrolled: false,
            paymentStatus: "NotEnrolled",
          },
          message: "شما در این دوره ثبت‌نام نکرده‌اید",
        };
      } else {
        return {
          success: false,
          error: "FETCH_ERROR",
          message: "خطا در بررسی وضعیت ثبت‌نام",
        };
      }
    }
  }

  /**
   * دریافت جزئیات یک دوره
   * @param {string} courseId شناسه دوره
   * @returns {Promise<Object>} جزئیات دوره
   */
  static async getCourseDetails(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: "جزئیات دوره دریافت شد",
      };
    } catch (error) {
      console.error("Error fetching course details:", error);
      return {
        success: false,
        error: "FETCH_ERROR",
        message: "خطا در دریافت جزئیات دوره",
      };
    }
  }

  /**
   * فیلتر و دسته‌بندی دوره‌ها
   * @param {Array} courses لیست دوره‌ها
   * @returns {Object} دوره‌های دسته‌بندی شده
   */
  static categorizeCourses(courses) {
    if (!Array.isArray(courses)) {
      return {
        active: [],
        completed: [],
        upcoming: [],
        all: [],
      };
    }

    return {
      // دوره‌های فعال (شروع شده و تکمیل نشده)
      active: courses.filter(
        (course) => course.isStarted && !course.isCompleted
      ),

      // دوره‌های تکمیل شده
      completed: courses.filter((course) => course.isCompleted),

      // دوره‌های آینده (هنوز شروع نشده)
      upcoming: courses.filter(
        (course) => !course.isStarted && !course.isCompleted
      ),

      // همه دوره‌ها
      all: courses,
    };
  }

  /**
   * محاسبه آمار دوره‌ها
   * @param {Array} courses لیست دوره‌ها
   * @returns {Object} آمار دوره‌ها
   */
  static calculateStats(courses) {
    if (!Array.isArray(courses)) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        upcoming: 0,
        totalHours: 0,
        certificates: 0,
      };
    }

    const categorized = this.categorizeCourses(courses);

    return {
      total: courses.length,
      active: categorized.active.length,
      completed: categorized.completed.length,
      upcoming: categorized.upcoming.length,
      totalHours: courses.reduce((sum, course) => {
        // فرض می‌کنیم هر دوره حداقل 10 ساعت است
        return sum + (course.duration || 10);
      }, 0),
      certificates: categorized.completed.length, // تعداد گواهینامه‌ها
    };
  }
}

export default CourseService;
