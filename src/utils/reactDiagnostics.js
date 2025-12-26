/**
 * React Diagnostics Utility
 * برای تشخیص مشکلات React Hooks
 */

export const checkReactEnvironment = () => {
  console.log("🩺 React diagnostics");

  try {
    // Check if React is available globally
    if (typeof window !== "undefined" && window.React) {
      console.log("✅ React found:", window.React.version);

      // Check hooks availability
      const hooks = [
        "useState",
        "useEffect",
        "useMemo",
        "useCallback",
        "useContext",
      ];
      hooks.forEach((hook) => {
        if (typeof window.React[hook] === "function") {
          console.log(`✅ ${hook} available`);
        } else {
          console.error(`❌ ${hook} not available`);
        }
      });

      console.log("✅ React environment check completed");
      return true;
    } else {
      console.warn("⚠️ React not found on window object");
      return false;
    }
  } catch (error) {
    console.error("❌ React diagnostics failed:", error);
    return false;
  }
};

// Auto-run diagnostics in development
if (typeof window !== "undefined" && import.meta.env?.DEV) {
  checkReactEnvironment();
}
