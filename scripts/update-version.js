#!/usr/bin/env node

/**
 * 🔄 Auto Version Updater
 * این اسکریپت version را در فایل‌های مختلف به‌روزرسانی می‌کند
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تولید version جدید
const generateVersion = () => {
  const now = new Date();
  const timestamp = now.getTime();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");

  return {
    full: `v${dateStr}-${timestamp}`,
    short: `v${dateStr}`,
    timestamp: timestamp,
  };
};

// به‌روزرسانی Service Worker
const updateServiceWorker = (version) => {
  const swPath = path.join(__dirname, "../public/sw.js");

  if (fs.existsSync(swPath)) {
    let content = fs.readFileSync(swPath, "utf8");

    // جایگزینی version در Service Worker
    content = content.replace(
      /const APP_VERSION = "v[\d\.]+-\d+"/,
      `const APP_VERSION = "${version.full}"`
    );

    fs.writeFileSync(swPath, content);
    console.log(`✅ Updated Service Worker version to: ${version.full}`);
  }
};

// به‌روزرسانی Cache Manager
const updateCacheManager = (version) => {
  const cachePath = path.join(__dirname, "../src/utils/cacheManager.js");

  if (fs.existsSync(cachePath)) {
    let content = fs.readFileSync(cachePath, "utf8");

    // جایگزینی version در Cache Manager
    content = content.replace(
      /this\.APP_VERSION = "[\d\.-v]+"/,
      `this.APP_VERSION = "${version.full}"`
    );

    fs.writeFileSync(cachePath, content);
    console.log(`✅ Updated Cache Manager version to: ${version.full}`);
  }
};

// به‌روزرسانی package.json
const updatePackageJson = (version) => {
  const packagePath = path.join(__dirname, "../package.json");

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    packageJson.version = version.short.replace("v", "");

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated package.json version to: ${packageJson.version}`);
  }
};

// اجرای اصلی
const main = () => {
  console.log("🔄 Updating application version...");

  const version = generateVersion();

  console.log(`📦 New version: ${version.full}`);

  try {
    updateServiceWorker(version);
    updateCacheManager(version);
    updatePackageJson(version);

    console.log("✅ Version update completed successfully!");
    console.log(`🚀 Ready for deployment with version: ${version.full}`);

    // ذخیره version info برای استفاده در CI/CD
    const versionInfo = {
      version: version.full,
      timestamp: version.timestamp,
      date: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(__dirname, "../version.json"),
      JSON.stringify(versionInfo, null, 2)
    );
  } catch (error) {
    console.error("❌ Failed to update version:", error);
    process.exit(1);
  }
};

// اجرا فقط اگر مستقیماً فراخوانی شده باشد
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}

export {
  generateVersion,
  updateServiceWorker,
  updateCacheManager,
  updatePackageJson,
  main,
};
