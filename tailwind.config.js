/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "sans-serif"],
      },
      // بهینه‌سازی breakpoints برای موبایل
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        // breakpoints خاص موبایل
        mobile: { max: "767px" },
        tablet: { min: "768px", max: "1023px" },
        desktop: { min: "1024px" },
      },
      colors: {
        // Logo-derived Primary Colors (Navy Blue from Pardis logo)
        primary: {
          50: "#eef3f6",
          100: "#dde8ee",
          200: "#c4d6e0",
          300: "#a9c2d0",
          400: "#86a7bd",
          500: "#2A5370", // Secondary from logo
          600: "#0B2D5F", // Primary/Identity from logo - main brand color
          700: "#082447",
          800: "#051b37",
          900: "#031227",
          DEFAULT: "#0B2D5F", // Primary as default
          hover: "#2A5370",
          light: "#e7f0f3",
        },

        // Secondary/Accent Colors (Teal from logo)
        secondary: {
          50: "#eaf2f4",
          100: "#d6e6ea",
          200: "#b5d0d8",
          300: "#9CC7D6", // Light Surface from logo
          400: "#76A4B2", // Soft Accent from logo
          500: "#4E7B89", // Accent from logo
          600: "#3d6470",
          700: "#2d4d57",
          800: "#1e363e",
          900: "#0f1f25",
          DEFAULT: "#4E7B89",
        },

        // Neutral Colors for Text and Backgrounds
        neutral: {
          50: "#f4f5f6",
          100: "#eceef0",
          200: "#DFE1E3", // Neutral/Border from logo
          300: "#c8cdd1",
          400: "#b1b9c0",
          500: "#8b949d",
          600: "#6b7680",
          700: "#4e5861",
          800: "#2f3942",
          900: "#1f2a33",
        },

        // Semantic UI Colors
        surface: {
          primary: "#DFE1E3",
          secondary: "#e7f0f3",
          tertiary: "#DFE1E3", // Using neutral/border color
          light: "#9CC7D6", // Light Surface from logo
        },

        border: {
          light: "#DFE1E3", // Neutral/Border from logo
          medium: "#c8cdd2",
          strong: "#b1b9c0",
        },

        text: {
          primary: "#0B2D5F", // Primary/Identity for headings
          secondary: "#1f4259", // Darkened secondary for body text
          tertiary: "#4E7B89", // Accent for captions
          inverse: "#f2f7f9", // Light text on dark backgrounds
        },

        // State Colors (using brand palette)
        success: {
          50: "#eaf2f4",
          200: "#b5d0d8",
          500: "#4E7B89", // Brand accent for success
          600: "#3d6470",
          700: "#2d4d57",
          800: "#1e363e",
        },

        warning: {
          50: "#e4ebf0",
          200: "#b6c9d5",
          500: "#2A5370",
          600: "#23465e",
          700: "#1c384a",
          800: "#152c3a",
        },

        error: {
          50: "#e3eaf1",
          200: "#b8c8d9",
          500: "#0B2D5F",
          600: "#082447",
          700: "#061b35",
          800: "#041226",
        },

        // Legacy brand colors (keeping for backward compatibility)
        brand: {
          50: "#f0f4f8",
          100: "#d9e6f2",
          500: "#2A5370",
          600: "#0B2D5F",
          900: "#031227",
        },
      },
      // اندازه‌های بهینه برای موبایل
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      // حداقل ارتفاع برای touch targets
      minHeight: {
        touch: "44px",
        button: "48px",
      },
      minWidth: {
        touch: "44px",
        button: "48px",
      },
      // انیمیشن‌های بهینه برای موبایل
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
