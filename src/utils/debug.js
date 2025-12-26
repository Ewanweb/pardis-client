/**
 * Debug utilities برای تشخیص مشکلات
 */

export const debugLog = (message, data = null) => {
  if (process.env.NODE_ENV === "development") {
    try {
      console.log(`[DEBUG] ${message}`, data);
    } catch (error) {
      // Ignore debug errors
    }
  }
};

export const debugError = (message, error = null) => {
  if (process.env.NODE_ENV === "development") {
    try {
      console.error(`[DEBUG ERROR] ${message}`, error);
    } catch (e) {
      // Ignore debug errors
    }
  }
};

export const debugReactHook = (hookName, props, result) => {
  if (process.env.NODE_ENV === "development") {
    try {
      console.group(`[HOOK DEBUG] ${hookName}`);
      console.log("Props:", props);
      console.log("Result:", result);
      console.groupEnd();
    } catch (error) {
      // Ignore debug errors
    }
  }
};

export const checkReactImports = () => {
  try {
    // Try to access React from window first
    let React = window.React;

    // If not available, try require
    if (!React) {
      React = require("react");
    }

    if (React) {
      console.log("React version:", React.version);
      console.log("useMemo available:", typeof React.useMemo === "function");
      console.log("useState available:", typeof React.useState === "function");
      console.log(
        "useEffect available:",
        typeof React.useEffect === "function"
      );
      return true;
    } else {
      console.error("React not found");
      return false;
    }
  } catch (error) {
    console.error("React import error:", error);
    return false;
  }
};
