/**
 * 🎯 Backend API برای مدیریت اسلایدها و استوری‌ها
 * این فایل شامل تمام endpoint های مورد نیاز برای مدیریت اسلایدها است
 *
 * استفاده:
 * 1. این فایل را در پروژه backend خود قرار دهید
 * 2. با Express.js یا framework مورد نظر خود integrate کنید
 * 3. دیتابیس مورد نظر (MongoDB, MySQL, PostgreSQL) را متصل کنید
 */

// ===== DEPENDENCIES =====
// const express = require('express');
// const mongoose = require('mongoose'); // برای MongoDB
// const multer = require('multer'); // برای آپلود فایل
// const path = require('path');
// const fs = require('fs');

// ===== DATABASE SCHEMAS =====

/**
 * MongoDB Schema برای اسلایدها
 */
const slideSchema = {
  id: String, // unique identifier
  title: String, // عنوان اسلاید
  description: String, // توضیحات
  image: String, // آدرس تصویر
  badge: String, // برچسب
  slideType: {
    type: String,
    enum: ["permanent", "temporary"],
    default: "permanent",
  },
  createdAt: Date,
  expiresAt: Date, // null برای permanent slides
  stats: [
    {
      icon: String, // نام آیکون
      value: String, // مقدار
      label: String, // برچسب
    },
  ],
  primaryAction: {
    label: String, // متن دکمه
    link: String, // لینک (داخلی یا خارجی)
    onClick: String, // JavaScript code (اختیاری)
  },
  secondaryAction: {
    label: String,
    link: String,
    onClick: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
};

/**
 * MongoDB Schema برای استوری‌ها
 */
const storySchema = {
  id: String,
  title: String,
  subtitle: String,
  description: String,
  image: String,
  badge: String,
  icon: String, // نام آیکون
  type: {
    type: String,
    enum: ["success", "video", "image"],
    default: "success",
  },
  storyType: {
    type: String,
    enum: ["permanent", "temporary"],
    default: "permanent",
  },
  duration: {
    type: Number,
    default: 5000, // میلی‌ثانیه
  },
  createdAt: Date,
  expiresAt: Date,
  stats: [
    {
      value: String,
      label: String,
    },
  ],
  action: {
    label: String,
    link: String,
    onClick: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
};

// ===== API ENDPOINTS =====

/**
 * 📊 GET /api/slides
 * دریافت تمام اسلایدها
 */
const getSlides = async (req, res) => {
  try {
    const {
      active = null,
      type = null,
      limit = null,
      includeExpired = false,
    } = req.query;

    let query = {};

    // فیلتر بر اساس وضعیت فعال/غیرفعال
    if (active !== null) {
      query.isActive = active === "true";
    }

    // فیلتر بر اساس نوع اسلاید
    if (type) {
      query.slideType = type;
    }

    // حذف اسلایدهای منقضی شده (اگر درخواست نشده باشد)
    if (!includeExpired) {
      query.$or = [
        { slideType: "permanent" },
        {
          slideType: "temporary",
          expiresAt: { $gt: new Date() },
        },
      ];
    }

    let slidesQuery = Slide.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      slidesQuery = slidesQuery.limit(parseInt(limit));
    }

    const slides = await slidesQuery.exec();

    res.json({
      success: true,
      data: slides,
      count: slides.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اسلایدها",
      error: error.message,
    });
  }
};

/**
 * 📝 POST /api/slides
 * ایجاد اسلاید جدید
 */
const createSlide = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      badge,
      slideType = "permanent",
      stats = [],
      primaryAction = {},
      secondaryAction = {},
      isActive = true,
      order = 0,
    } = req.body;

    // اعتبارسنجی
    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: "عنوان و تصویر الزامی هستند",
      });
    }

    const slideData = {
      id: `slide-${Date.now()}`,
      title,
      description,
      image,
      badge,
      slideType,
      createdAt: new Date(),
      expiresAt:
        slideType === "temporary"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null, // 24 ساعت
      stats,
      primaryAction,
      secondaryAction,
      isActive,
      order,
    };

    const slide = new Slide(slideData);
    await slide.save();

    res.status(201).json({
      success: true,
      message: "اسلاید با موفقیت ایجاد شد",
      data: slide,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در ایجاد اسلاید",
      error: error.message,
    });
  }
};

/**
 * ✏️ PUT /api/slides/:id
 * ویرایش اسلاید
 */
const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // حذف فیلدهای غیرقابل ویرایش
    delete updateData.id;
    delete updateData.createdAt;

    const slide = await Slide.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "اسلاید یافت نشد",
      });
    }

    res.json({
      success: true,
      message: "اسلاید با موفقیت به‌روزرسانی شد",
      data: slide,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی اسلاید",
      error: error.message,
    });
  }
};

/**
 * 🗑️ DELETE /api/slides/:id
 * حذف اسلاید
 */
const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await Slide.findOneAndDelete({ id });

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "اسلاید یافت نشد",
      });
    }

    res.json({
      success: true,
      message: "اسلاید با موفقیت حذف شد",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در حذف اسلاید",
      error: error.message,
    });
  }
};

/**
 * 🔄 PATCH /api/slides/:id/toggle
 * تغییر وضعیت فعال/غیرفعال اسلاید
 */
const toggleSlideStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await Slide.findOne({ id });

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "اسلاید یافت نشد",
      });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    res.json({
      success: true,
      message: `اسلاید ${slide.isActive ? "فعال" : "غیرفعال"} شد`,
      data: slide,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در تغییر وضعیت اسلاید",
      error: error.message,
    });
  }
};

/**
 * 📊 GET /api/stories
 * دریافت تمام استوری‌ها
 */
const getStories = async (req, res) => {
  try {
    const {
      active = null,
      type = null,
      limit = null,
      includeExpired = false,
    } = req.query;

    let query = {};

    if (active !== null) {
      query.isActive = active === "true";
    }

    if (type) {
      query.storyType = type;
    }

    if (!includeExpired) {
      query.$or = [
        { storyType: "permanent" },
        {
          storyType: "temporary",
          expiresAt: { $gt: new Date() },
        },
      ];
    }

    let storiesQuery = Story.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      storiesQuery = storiesQuery.limit(parseInt(limit));
    }

    const stories = await storiesQuery.exec();

    res.json({
      success: true,
      data: stories,
      count: stories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در دریافت استوری‌ها",
      error: error.message,
    });
  }
};

/**
 * 📝 POST /api/stories
 * ایجاد استوری جدید
 */
const createStory = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      image,
      badge,
      icon,
      type = "success",
      storyType = "permanent",
      duration = 5000,
      stats = [],
      action = {},
      isActive = true,
      order = 0,
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: "عنوان و تصویر الزامی هستند",
      });
    }

    const storyData = {
      id: `story-${Date.now()}`,
      title,
      subtitle,
      description,
      image,
      badge,
      icon,
      type,
      storyType,
      duration,
      createdAt: new Date(),
      expiresAt:
        storyType === "temporary"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      stats,
      action,
      isActive,
      order,
    };

    const story = new Story(storyData);
    await story.save();

    res.status(201).json({
      success: true,
      message: "استوری با موفقیت ایجاد شد",
      data: story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در ایجاد استوری",
      error: error.message,
    });
  }
};

/**
 * ✏️ PUT /api/stories/:id
 * ویرایش استوری
 */
const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.createdAt;

    const story = await Story.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "استوری یافت نشد",
      });
    }

    res.json({
      success: true,
      message: "استوری با موفقیت به‌روزرسانی شد",
      data: story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی استوری",
      error: error.message,
    });
  }
};

/**
 * 🗑️ DELETE /api/stories/:id
 * حذف استوری
 */
const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findOneAndDelete({ id });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "استوری یافت نشد",
      });
    }

    res.json({
      success: true,
      message: "استوری با موفقیت حذف شد",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در حذف استوری",
      error: error.message,
    });
  }
};

/**
 * 🔄 PATCH /api/stories/:id/toggle
 * تغییر وضعیت فعال/غیرفعال استوری
 */
const toggleStoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findOne({ id });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "استوری یافت نشد",
      });
    }

    story.isActive = !story.isActive;
    await story.save();

    res.json({
      success: true,
      message: `استوری ${story.isActive ? "فعال" : "غیرفعال"} شد`,
      data: story,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در تغییر وضعیت استوری",
      error: error.message,
    });
  }
};

/**
 * 📤 POST /api/upload/image
 * آپلود تصویر برای اسلایدها و استوری‌ها
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "فایل تصویر الزامی است",
      });
    }

    // بررسی نوع فایل
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "فقط فایل‌های تصویری مجاز هستند",
      });
    }

    // بررسی اندازه فایل (حداکثر 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "حداکثر اندازه فایل 5 مگابایت است",
      });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      message: "تصویر با موفقیت آپلود شد",
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در آپلود تصویر",
      error: error.message,
    });
  }
};

/**
 * 🧹 DELETE /api/cleanup/expired
 * پاک کردن اسلایدها و استوری‌های منقضی شده
 */
const cleanupExpired = async (req, res) => {
  try {
    const now = new Date();

    // حذف اسلایدهای منقضی شده
    const expiredSlides = await Slide.deleteMany({
      slideType: "temporary",
      expiresAt: { $lt: now },
    });

    // حذف استوری‌های منقضی شده
    const expiredStories = await Story.deleteMany({
      storyType: "temporary",
      expiresAt: { $lt: now },
    });

    res.json({
      success: true,
      message: "آیتم‌های منقضی شده پاک شدند",
      data: {
        deletedSlides: expiredSlides.deletedCount,
        deletedStories: expiredStories.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در پاک کردن آیتم‌های منقضی شده",
      error: error.message,
    });
  }
};

/**
 * 📊 GET /api/analytics/slides
 * آمار و تحلیل اسلایدها
 */
const getSlidesAnalytics = async (req, res) => {
  try {
    const totalSlides = await Slide.countDocuments();
    const activeSlides = await Slide.countDocuments({ isActive: true });
    const permanentSlides = await Slide.countDocuments({
      slideType: "permanent",
    });
    const temporarySlides = await Slide.countDocuments({
      slideType: "temporary",
    });
    const expiredSlides = await Slide.countDocuments({
      slideType: "temporary",
      expiresAt: { $lt: new Date() },
    });

    res.json({
      success: true,
      data: {
        total: totalSlides,
        active: activeSlides,
        inactive: totalSlides - activeSlides,
        permanent: permanentSlides,
        temporary: temporarySlides,
        expired: expiredSlides,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در دریافت آمار اسلایدها",
      error: error.message,
    });
  }
};

// ===== EXPRESS ROUTES SETUP =====

/**
 * نحوه استفاده در Express.js:
 *
 * const express = require('express');
 * const router = express.Router();
 * const multer = require('multer');
 *
 * // تنظیم multer برای آپلود فایل
 * const storage = multer.diskStorage({
 *   destination: (req, file, cb) => {
 *     cb(null, 'uploads/images/');
 *   },
 *   filename: (req, file, cb) => {
 *     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
 *     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
 *   }
 * });
 *
 * const upload = multer({ storage });
 *
 * // Slides Routes
 * router.get('/slides', getSlides);
 * router.post('/slides', createSlide);
 * router.put('/slides/:id', updateSlide);
 * router.delete('/slides/:id', deleteSlide);
 * router.patch('/slides/:id/toggle', toggleSlideStatus);
 *
 * // Stories Routes
 * router.get('/stories', getStories);
 * router.post('/stories', createStory);
 * router.put('/stories/:id', updateStory);
 * router.delete('/stories/:id', deleteStory);
 * router.patch('/stories/:id/toggle', toggleStoryStatus);
 *
 * // Upload Route
 * router.post('/upload/image', upload.single('image'), uploadImage);
 *
 * // Utility Routes
 * router.delete('/cleanup/expired', cleanupExpired);
 * router.get('/analytics/slides', getSlidesAnalytics);
 *
 * module.exports = router;
 */

// ===== MIDDLEWARE =====

/**
 * Middleware برای اعتبارسنجی ادمین
 */
const requireAdmin = (req, res, next) => {
  // بررسی token و سطح دسترسی کاربر
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "توکن احراز هویت الزامی است",
    });
  }

  // اینجا باید token را verify کنید و بررسی کنید که کاربر ادمین است
  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err || !decoded.isAdmin) {
  //     return res.status(403).json({
  //       success: false,
  //       message: 'دسترسی مجاز نیست'
  //     });
  //   }
  //   req.user = decoded;
  //   next();
  // });

  next(); // فعلاً بدون بررسی
};

/**
 * Middleware برای لاگ کردن درخواست‌ها
 */
const logRequests = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// ===== CRON JOBS =====

/**
 * Cron job برای پاک کردن خودکار آیتم‌های منقضی شده
 * هر 6 ساعت یکبار اجرا می‌شود
 */
const setupCleanupCron = () => {
  // const cron = require('node-cron');
  // cron.schedule('0 */6 * * *', async () => {
  //   console.log('Running cleanup for expired items...');
  //   try {
  //     const now = new Date();
  //
  //     const expiredSlides = await Slide.deleteMany({
  //       slideType: 'temporary',
  //       expiresAt: { $lt: now }
  //     });
  //
  //     const expiredStories = await Story.deleteMany({
  //       storyType: 'temporary',
  //       expiresAt: { $lt: now }
  //     });
  //
  //     console.log(`Cleanup completed: ${expiredSlides.deletedCount} slides, ${expiredStories.deletedCount} stories deleted`);
  //   } catch (error) {
  //     console.error('Cleanup failed:', error);
  //   }
  // });
};

// ===== EXPORT =====
module.exports = {
  // Slide functions
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  toggleSlideStatus,

  // Story functions
  getStories,
  createStory,
  updateStory,
  deleteStory,
  toggleStoryStatus,

  // Utility functions
  uploadImage,
  cleanupExpired,
  getSlidesAnalytics,

  // Middleware
  requireAdmin,
  logRequests,

  // Setup functions
  setupCleanupCron,

  // Schemas (for reference)
  slideSchema,
  storySchema,
};

/**
 * 📋 TODO LIST برای پیاده‌سازی کامل:
 *
 * 1. ✅ ایجاد API endpoints
 * 2. ⏳ اتصال به دیتابیس (MongoDB/MySQL/PostgreSQL)
 * 3. ⏳ پیاده‌سازی authentication و authorization
 * 4. ⏳ اضافه کردن validation بیشتر
 * 5. ⏳ پیاده‌سازی rate limiting
 * 6. ⏳ اضافه کردن logging و monitoring
 * 7. ⏳ تست‌های واحد و integration
 * 8. ⏳ مستندسازی API با Swagger
 * 9. ⏳ پیاده‌سازی caching (Redis)
 * 10. ⏳ اضافه کردن backup و recovery
 */
