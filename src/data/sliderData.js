import {
  Users,
  Clock,
  Star,
  BookOpen,
  Code,
  Palette,
  Database,
  Smartphone,
} from "lucide-react";

// Hero Slider Data
export const heroSlides = [
  {
    id: "slide-1",
    title: "آموزش برنامه‌نویسی از صفر تا صد",
    description:
      "با مسیرهای یادگیری پروژه‌محور، مهارت‌های کدنویسی خود را حرفه‌ای کنید",
    image:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    badge: "محبوب‌ترین دوره‌ها",
    slideType: "permanent", // permanent | temporary
    createdAt: new Date().toISOString(),
    expiresAt: null, // null for permanent slides
    stats: [
      { icon: Users, value: "2000+", label: "دانشجو" },
      { icon: Star, value: "4.9", label: "امتیاز" },
      { icon: Clock, value: "24/7", label: "پشتیبانی" },
    ],
    primaryAction: {
      label: "شروع یادگیری",
      link: "/courses", // لینک داخلی
      onClick: () =>
        window.scrollTo({
          top: document.getElementById("courses")?.offsetTop,
          behavior: "smooth",
        }),
    },
    secondaryAction: {
      label: "مشاهده نمونه",
      link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // لینک خارجی
      onClick: () => console.log("Play demo"),
    },
  },
  {
    id: "slide-2",
    title: "طراحی UI/UX حرفه‌ای",
    description: "از اصول طراحی تا ساخت پروتوتایپ‌های تعاملی با ابزارهای مدرن",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    badge: "جدیدترین دوره",
    slideType: "temporary",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(), // expires in 21 hours
    stats: [
      { icon: Users, value: "1500+", label: "دانشجو" },
      { icon: Star, value: "4.8", label: "امتیاز" },
      { icon: BookOpen, value: "12", label: "پروژه" },
    ],
    primaryAction: {
      label: "ثبت‌نام کنید",
      link: "/courses?category=design", // لینک داخلی با query parameter
      onClick: () =>
        window.scrollTo({
          top: document.getElementById("courses")?.offsetTop,
          behavior: "smooth",
        }),
    },
    secondaryAction: {
      label: "نمونه کارها",
      link: "https://dribbble.com/shots/popular/web-design", // لینک خارجی
      onClick: () => console.log("View portfolio"),
    },
  },
  {
    id: "slide-3",
    title: "توسعه اپلیکیشن موبایل",
    description: "با React Native و Flutter اپلیکیشن‌های کراس پلتفرم بسازید",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    badge: "پرطرفدار",
    slideType: "permanent",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    expiresAt: null,
    stats: [
      { icon: Users, value: "1200+", label: "دانشجو" },
      { icon: Smartphone, value: "15+", label: "اپلیکیشن" },
      { icon: Star, value: "4.7", label: "امتیاز" },
    ],
    primaryAction: {
      label: "شروع دوره",
      link: "/courses?category=mobile", // لینک داخلی
      onClick: () =>
        window.scrollTo({
          top: document.getElementById("courses")?.offsetTop,
          behavior: "smooth",
        }),
    },
    secondaryAction: {
      label: "اپ‌های نمونه",
      link: "https://play.google.com/store/apps/developer?id=Pardis+Academy", // لینک خارجی
      onClick: () => console.log("View apps"),
    },
  },
];

// Story Slider Data
export const successStories = [
  {
    id: "story-1",
    title: "از صفر تا برنامه‌نویس",
    subtitle: "سارا احمدی",
    description:
      "بعد از گذراندن دوره React، الان توی یک شرکت بین‌المللی کار می‌کنم و درآمد ماهانه‌ام 3 برابر شده!",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    badge: "موفقیت",
    icon: Code,
    type: "success",
    storyType: "permanent", // permanent | temporary
    duration: 6000,
    createdAt: new Date().toISOString(),
    expiresAt: null, // null for permanent stories
    stats: [
      { value: "6 ماه", label: "مدت یادگیری" },
      { value: "15M", label: "حقوق فعلی" },
    ],
    action: {
      label: "مشاهده پروفایل",
      link: "/profile/sara-ahmadi", // لینک داخلی
      onClick: () => console.log("View profile"),
    },
  },
  {
    id: "story-2",
    title: "طراح UI/UX شدم",
    subtitle: "محمد رضایی",
    description:
      "دوره طراحی رابط کاربری زندگی‌ام رو عوض کرد. الان فریلنسر هستم و پروژه‌های بین‌المللی می‌گیرم.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    badge: "طراح",
    icon: Palette,
    type: "success",
    storyType: "temporary",
    duration: 5500,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // expires in 22 hours
    stats: [
      { value: "4 ماه", label: "مدت یادگیری" },
      { value: "20+", label: "پروژه موفق" },
    ],
    action: {
      label: "نمونه کارها",
      link: "https://behance.net/mohammad-rezaei", // لینک خارجی
      onClick: () => console.log("View portfolio"),
    },
  },
  {
    id: "story-3",
    title: "استارتاپ راه انداختم",
    subtitle: "الناز حسینی",
    description:
      "با مهارت‌هایی که از دوره فول‌استک یاد گرفتم، استارتاپ خودم رو راه انداختم و الان 10 نفر تیم دارم.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    badge: "کارآفرین",
    icon: BookOpen,
    type: "success",
    storyType: "permanent",
    duration: 7000,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    expiresAt: null,
    stats: [
      { value: "8 ماه", label: "مدت یادگیری" },
      { value: "10 نفر", label: "تیم فعلی" },
    ],
    action: {
      label: "داستان کامل",
      link: "/success-stories/elnaz-hosseini", // لینک داخلی
      onClick: () => console.log("Read full story"),
    },
  },
  {
    id: "story-4",
    title: "توسعه‌دهنده موبایل",
    subtitle: "امیر کریمی",
    description:
      "دوره React Native باعث شد بتونم اپلیکیشن‌های موبایل بسازم. الان چندین اپ موفق در بازار دارم.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    badge: "موبایل",
    icon: Smartphone,
    type: "success",
    storyType: "temporary",
    duration: 5000,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // expires in 12 hours
    stats: [
      { value: "5 ماه", label: "مدت یادگیری" },
      { value: "50K+", label: "دانلود اپ" },
    ],
    action: {
      label: "اپلیکیشن‌ها",
      link: "https://play.google.com/store/apps/developer?id=Amir+Karimi", // لینک خارجی
      onClick: () => console.log("View apps"),
    },
  },
  {
    id: "story-5",
    title: "متخصص دیتابیس",
    subtitle: "فاطمه نوری",
    description:
      "دوره‌های دیتابیس و SQL من رو به یک متخصص داده تبدیل کرد. الان توی یک شرکت فین‌تک کار می‌کنم.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    badge: "داده",
    icon: Database,
    type: "success",
    storyType: "permanent",
    duration: 6500,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    expiresAt: null,
    stats: [
      { value: "7 ماه", label: "مدت یادگیری" },
      { value: "Big Data", label: "تخصص" },
    ],
    action: {
      label: "مسیر یادگیری",
      link: "/learning-paths/data-science", // لینک داخلی
      onClick: () => console.log("View learning path"),
    },
  },
  {
    id: "story-6",
    title: "مدرس شدم",
    subtitle: "حسین احمدی",
    description:
      "بعد از تسلط کامل بر برنامه‌نویسی، الان خودم مدرس هستم و به دیگران آموزش می‌دم.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    badge: "مدرس",
    icon: BookOpen,
    type: "success",
    storyType: "temporary",
    duration: 5800,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // expires in 18 hours
    stats: [
      { value: "1 سال", label: "مدت یادگیری" },
      { value: "500+", label: "دانشجو" },
    ],
    action: {
      label: "دوره‌های من",
      link: "/instructor/hossein-ahmadi", // لینک داخلی
      onClick: () => console.log("View courses"),
    },
  },
];

// Featured Stories for Homepage
export const featuredStories = successStories.slice(0, 8);
