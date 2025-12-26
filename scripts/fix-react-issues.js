#!/usr/bin/env node

/**
 * Script to fix React hook issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 Fixing React hook issues...");

// Clear node_modules/.vite cache
const viteCachePath = path.join(__dirname, "../node_modules/.vite");
if (fs.existsSync(viteCachePath)) {
  console.log("🗑️ Clearing Vite cache...");
  fs.rmSync(viteCachePath, { recursive: true, force: true });
}

// Clear dist folder
const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  console.log("🗑️ Clearing dist folder...");
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Clear browser cache files
const cachePaths = [
  path.join(__dirname, "../.vite"),
  path.join(__dirname, "../node_modules/.cache"),
];

cachePaths.forEach((cachePath) => {
  if (fs.existsSync(cachePath)) {
    console.log(`🗑️ Clearing ${cachePath}...`);
    fs.rmSync(cachePath, { recursive: true, force: true });
  }
});

console.log("✅ Cache cleared!");
console.log("");
console.log("🔄 IMPORTANT: Please follow these steps:");
console.log("1. Stop the development server (Ctrl+C)");
console.log("2. Run: npm run dev");
console.log("3. If issues persist, try: rm -rf node_modules && npm install");
console.log("4. Check browser console for any remaining errors");
console.log("");
console.log("📝 Changes made:");
console.log("- Replaced useSEO hooks with non-hook helpers");
console.log("- Added React path aliases to Vite config");
console.log("- Enhanced cache clearing");
console.log("- Added React diagnostics");
