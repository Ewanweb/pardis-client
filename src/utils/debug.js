/**
 * Debug utilities برای تشخیص مشکلات
 */

export const debugLog = (message, data = null) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const debugError = (message, error = null) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[DEBUG ERROR] ${message}`, error);
  }
};

export const debugReactHook = (hookName, props, result) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`[HOOK DEBUG] ${hookName}`);
    console.log("Props:", props);
    console.log("Result:", result);
    console.groupEnd();
  }
};

export const checkReactImports = () => {
  try {
    const React = require("react");
    console.log("React version:", React.version);
    console.log("useMemo available:", typeof React.useMemo === "function");
    console.log("useState available:", typeof React.useState === "function");
    console.log("useEffect available:", typeof React.useEffect === "function");
    return true;
  } catch (error) {
    console.error("React import error:", error);
    return false;
  }
};
