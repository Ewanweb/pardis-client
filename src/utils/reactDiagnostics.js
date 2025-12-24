// Temporary diagnostics to investigate production-only React runtime crash
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const reactIndexSpecifier = ["react", "index.js"].join("/");

const logGroup = (reactIndexModule, reactIndexError) => {
  const devtoolsHook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const rendererCount =
    devtoolsHook && devtoolsHook.renderers
      ? devtoolsHook.renderers.size
      : "not-installed";

  const scripts =
    typeof document !== "undefined"
      ? Array.from(document.scripts || []).map(
          (script) => script.src || "[inline]"
        )
      : [];

  console.groupCollapsed("🩺 React diagnostics");
  console.log("React.version", React.version);
  console.log("ReactDOM.version", ReactDOM.version || "n/a");
  console.log("React.Children defined", Boolean(React.Children));
  console.log(
    "React === React/index.js",
    React === reactIndexModule,
    reactIndexError ? `(react/index.js load error: ${reactIndexError.message})` : ""
  );
  console.log("Devtools renderer count", rendererCount);
  console.log("Loaded script tags", scripts);
  console.groupEnd();
};

const renderOverlay = (reactIndexModule, reactIndexError) => {
  if (typeof document === "undefined" || !import.meta.env.PROD) return;

  const existing = document.getElementById("react-diagnostics-overlay");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "react-diagnostics-overlay";
  overlay.style.position = "fixed";
  overlay.style.bottom = "12px";
  overlay.style.right = "12px";
  overlay.style.zIndex = "2147483647";
  overlay.style.background = "rgba(17, 24, 39, 0.9)";
  overlay.style.color = "#f9fafb";
  overlay.style.padding = "12px";
  overlay.style.fontFamily = "monospace";
  overlay.style.fontSize = "12px";
  overlay.style.borderRadius = "8px";
  overlay.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
  overlay.style.maxWidth = "320px";
  overlay.style.lineHeight = "1.4";

  overlay.innerHTML = `
    <div style="font-weight:600;margin-bottom:4px;">React diagnostics</div>
    <div>React: ${React.version}</div>
    <div>ReactDOM: ${ReactDOM.version || "n/a"}</div>
    <div>Children: ${Boolean(React.Children)}</div>
    <div>React === React/index.js: ${
      React === reactIndexModule ? "true" : "false"
    }</div>
    ${
      reactIndexError
        ? `<div style="color:#f97316;margin-top:4px;">react/index.js error: ${reactIndexError.message}</div>`
        : ""
    }
  `;

  document.body.appendChild(overlay);
};

(async () => {
  let reactIndexModule = React;
  let reactIndexError = null;

  try {
    reactIndexModule = await import(reactIndexSpecifier);
  } catch (error) {
    reactIndexError = error;
    reactIndexModule = React;
  }

  logGroup(reactIndexModule, reactIndexError);
  renderOverlay(reactIndexModule, reactIndexError);
})();
