#!/usr/bin/env node

/**
 * 🔄 Incremental Version Updater
 * این اسکریپت version را به صورت تدریجی آپدیت می‌کند
 */

const fs = require("fs");
const path = require("path");

// خواندن version فعلی از package.json
const getCurrentVersion = () => {
  const packagePath = path.join(__dirname, "../package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return packageJson.version || "1.0.0";
  }
  return "1.0.0";
};

// پارس کردن version
const parseVersion = (version) => {
  const parts = version.replace("v", "").split(".");
  return {
    major: parseInt(parts[0]) || 1,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
  };
};

// تولید version جدید (incremental)
const generateIncrementalVersion = (type = "patch") => {
  const currentVersion = getCurrentVersion();
  const parsed = parseVersion(currentVersion);

  switch (type) {
    case "major":
      parsed.major += 1;
      parsed.minor = 0;
      parsed.patch = 0;
      break;
    case "minor":
      parsed.minor += 1;
      parsed.patch = 0;
      break;
    case "patch":
    default:
      parsed.patch += 1;
      break;
  }

  const newVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}`;

  return {
    full: `v${newVersion}`,
    short: `v${newVersion}`,
    semantic: newVersion,
    timestamp: Date.now(),
    type: type,
  };
};

// به‌روزرسانی Service Worker
const updateServiceWorker = (version) => {
  const swPath = path.join(__dirname, "../public/sw.js");

  if (fs.existsSync(swPath)) {
    let content = fs.readFileSync(swPath, "utf8");

    // جایگزینی version در Service Worker
    content = content.replace(
      /const APP_VERSION = "v[\d\.-]+"/,
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
      `this.APP_VERSION = "${version.semantic}"`
    );

    fs.writeFileSync(cachePath, content);
    console.log(`✅ Updated Cache Manager version to: ${version.semantic}`);
  }
};

// به‌روزرسانی package.json
const updatePackageJson = (version) => {
  const packagePath = path.join(__dirname, "../package.json");

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    packageJson.version = version.semantic;

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated package.json version to: ${version.semantic}`);
  }
};

// نمایش تغییرات version
const showVersionChange = (oldVersion, newVersion) => {
  console.log("\n📊 Version Change Summary:");
  console.log(`   Old: ${oldVersion}`);
  console.log(`   New: ${newVersion.semantic}`);
  console.log(`   Type: ${newVersion.type.toUpperCase()}`);
  console.log(`   Full: ${newVersion.full}\n`);
};

// اجرای اصلی
const main = () => {
  // دریافت نوع version از command line arguments
  const args = process.argv.slice(2);
  const versionType = args[0] || "patch"; // patch, minor, major

  if (!["patch", "minor", "major"].includes(versionType)) {
    console.error("❌ Invalid version type. Use: patch, minor, or major");
    process.exit(1);
  }

  console.log(`🔄 Updating application version (${versionType})...`);

  const oldVersion = getCurrentVersion();
  const newVersion = generateIncrementalVersion(versionType);

  showVersionChange(oldVersion, newVersion);

  try {
    updateServiceWorker(newVersion);
    updateCacheManager(newVersion);
    updatePackageJson(newVersion);

    console.log("✅ Version update completed successfully!");
    console.log(`🚀 Ready for deployment with version: ${newVersion.full}`);

    // ذخیره version info برای استفاده در CI/CD
    const versionInfo = {
      version: newVersion.full,
      semantic: newVersion.semantic,
      type: newVersion.type,
      previous: oldVersion,
      timestamp: newVersion.timestamp,
      date: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(__dirname, "../version.json"),
      JSON.stringify(versionInfo, null, 2)
    );

    console.log(`📝 Version info saved to version.json`);
  } catch (error) {
    console.error("❌ Failed to update version:", error);
    process.exit(1);
  }
};

// اجرا فقط اگر مستقیماً فراخوانی شده باشد
if (require.main === module) {
  main();
}

module.exports = {
  generateIncrementalVersion,
  updateServiceWorker,
  updateCacheManager,
  updatePackageJson,
  getCurrentVersion,
  parseVersion,
};
