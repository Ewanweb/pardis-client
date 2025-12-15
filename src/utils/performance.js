// Performance monitoring utilities

export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
    }

    return result;
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Preload critical resources
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
};

// Lazy load components
export const createLazyComponent = (importFunc) => {
  return React.lazy(() =>
    importFunc().then((module) => ({
      default: module.default,
    }))
  );
};

// Web Vitals reporting
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Resource hints
export const addResourceHint = (href, rel = "prefetch", as = null) => {
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;
  document.head.appendChild(link);
};

// Critical CSS inlining
export const inlineCriticalCSS = (css) => {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};
