/**
 * SEO Performance Optimization Utilities
 * Balances SEO requirements with Core Web Vitals
 */

// Critical resource preloading for SEO
export const preloadSEOCriticalResources = (seoData) => {
  const preloadPromises = [];

  // Preload hero images for LCP optimization
  if (seoData.image && !seoData.image.startsWith("data:")) {
    const imagePreload = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = seoData.image;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
    preloadPromises.push(imagePreload);
  }

  // Preload critical fonts for CLS prevention
  const fontPreload = preloadCriticalFonts();
  preloadPromises.push(fontPreload);

  return Promise.allSettled(preloadPromises);
};

// Font preloading to prevent layout shift
const preloadCriticalFonts = () => {
  return new Promise((resolve) => {
    const fonts = [
      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2",
      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Bold.woff2",
    ];

    const preloadPromises = fonts.map((fontUrl) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = fontUrl;
      document.head.appendChild(link);

      return new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve; // Don't fail on font errors
        setTimeout(resolve, 3000); // Timeout after 3s
      });
    });

    Promise.allSettled(preloadPromises).then(resolve);
  });
};

// Lazy loading that preserves SEO crawlability
export class SEOFriendlyLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: "50px",
      threshold: 0.1,
      enableForBots: true, // Always load for search bots
      ...options,
    };

    this.isBot = this.detectSearchBot();
    this.observer = null;
    this.init();
  }

  detectSearchBot() {
    const userAgent = navigator.userAgent.toLowerCase();
    const bots = [
      "googlebot",
      "bingbot",
      "slurp",
      "duckduckbot",
      "baiduspider",
      "yandexbot",
      "facebookexternalhit",
      "twitterbot",
      "linkedinbot",
    ];

    return bots.some((bot) => userAgent.includes(bot));
  }

  init() {
    // For search bots, load everything immediately
    if (this.isBot && this.options.enableForBots) {
      this.loadAllImagesImmediately();
      return;
    }

    // For users, use intersection observer
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold,
        },
      );
    } else {
      // Fallback for older browsers
      this.loadAllImagesImmediately();
    }
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      this.loadImage(element);
    }
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      img.removeAttribute("data-srcset");
    }
  }

  loadAllImagesImmediately() {
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => this.loadImage(img));
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Performance monitoring for SEO-critical metrics
export class SEOPerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      TTFB: 800, // Time to First Byte
      FCP: 1800, // First Contentful Paint
      LCP: 2500, // Largest Contentful Paint
      CLS: 0.1, // Cumulative Layout Shift
      FID: 100, // First Input Delay
    };
  }

  async measureSEOMetrics() {
    try {
      // Measure TTFB
      const navigationTiming = performance.getEntriesByType("navigation")[0];
      if (navigationTiming) {
        this.metrics.TTFB =
          navigationTiming.responseStart - navigationTiming.requestStart;
      }

      // Measure Core Web Vitals
      if ("web-vitals" in window) {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } =
          await import("web-vitals");

        getCLS((metric) => {
          this.metrics.CLS = metric.value;
          this.reportMetric("CLS", metric.value);
        });

        getFID((metric) => {
          this.metrics.FID = metric.value;
          this.reportMetric("FID", metric.value);
        });

        getFCP((metric) => {
          this.metrics.FCP = metric.value;
          this.reportMetric("FCP", metric.value);
        });

        getLCP((metric) => {
          this.metrics.LCP = metric.value;
          this.reportMetric("LCP", metric.value);
        });

        getTTFB((metric) => {
          this.metrics.TTFB = metric.value;
          this.reportMetric("TTFB", metric.value);
        });
      }
    } catch (error) {
      console.warn("SEO Performance monitoring failed:", error);
    }
  }

  reportMetric(name, value) {
    const threshold = this.thresholds[name];
    const status = value <= threshold ? "good" : "needs-improvement";

    if (process.env.NODE_ENV === "development") {
      console.log(`SEO Metric ${name}: ${value}ms (${status})`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === "production" && window.gtag) {
      window.gtag("event", "web_vitals", {
        event_category: "SEO Performance",
        event_label: name,
        value: Math.round(value),
        custom_map: { metric_status: status },
      });
    }
  }

  getSEOScore() {
    const scores = Object.entries(this.metrics).map(([name, value]) => {
      const threshold = this.thresholds[name];
      return value <= threshold
        ? 100
        : Math.max(0, 100 - ((value - threshold) / threshold) * 50);
    });

    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b) / scores.length)
      : 0;
  }
}

// Resource hints optimization
export const optimizeResourceHints = (pageType, seoData) => {
  const hints = [];

  // DNS prefetch for external resources
  hints.push({ rel: "dns-prefetch", href: "//fonts.googleapis.com" });
  hints.push({ rel: "dns-prefetch", href: "//cdn.jsdelivr.net" });

  // Preconnect to critical origins
  if (seoData.image && seoData.image.startsWith("http")) {
    const imageOrigin = new URL(seoData.image).origin;
    hints.push({ rel: "preconnect", href: imageOrigin, crossorigin: true });
  }

  // Page-specific optimizations
  switch (pageType) {
    case "course":
      hints.push({ rel: "prefetch", href: "/api/courses/related" });
      break;
    case "category":
      hints.push({ rel: "prefetch", href: "/api/courses/popular" });
      break;
    case "home":
      hints.push({ rel: "prefetch", href: "/api/categories" });
      break;
  }

  // Apply hints to DOM
  hints.forEach((hint) => {
    const existingHint = document.querySelector(
      `link[rel="${hint.rel}"][href="${hint.href}"]`,
    );
    if (!existingHint) {
      const link = document.createElement("link");
      Object.assign(link, hint);
      document.head.appendChild(link);
    }
  });

  return hints;
};

// Critical CSS inlining for above-the-fold content
export const inlineCriticalCSS = (pageType) => {
  const criticalCSS = getCriticalCSSForPageType(pageType);

  if (criticalCSS) {
    const style = document.createElement("style");
    style.textContent = criticalCSS;
    style.setAttribute("data-critical", "true");
    document.head.appendChild(style);
  }
};

const getCriticalCSSForPageType = (pageType) => {
  // This would contain critical CSS for above-the-fold content
  const criticalStyles = {
    home: `
      .hero-section { display: block; }
      .navigation { display: flex; }
      .font-vazir { font-family: Vazirmatn, sans-serif; }
    `,
    course: `
      .course-header { display: block; }
      .course-meta { display: flex; }
    `,
    category: `
      .category-header { display: block; }
      .course-grid { display: grid; }
    `,
  };

  return criticalStyles[pageType] || "";
};

// Initialize SEO performance monitoring
export const initSEOPerformance = (pageType, seoData) => {
  const monitor = new SEOPerformanceMonitor();
  const lazyLoader = new SEOFriendlyLazyLoader();

  // Start monitoring
  monitor.measureSEOMetrics();

  // Optimize resource hints
  optimizeResourceHints(pageType, seoData);

  // Inline critical CSS
  inlineCriticalCSS(pageType);

  // Preload critical resources
  preloadSEOCriticalResources(seoData);

  return { monitor, lazyLoader };
};
