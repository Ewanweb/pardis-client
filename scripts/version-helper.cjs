#!/usr/bin/env node

/**
 * 🔧 Version Helper - ابزار کمکی برای مدیریت version
 */

const fs = require("fs");
const path = require("path");
const { getCurrentVersion, parseVersion } = require("./update-version.cjs");

// نمایش version فعلی
const showCurrentVersion = () => {
  const version = getCurrentVersion();
  const parsed = parseVersion(version);

  console.log("📦 Current Version Information:");
  console.log(`   Version: ${version}`);
  console.log(`   Major: ${parsed.major}`);
  console.log(`   Minor: ${parsed.minor}`);
  console.log(`   Patch: ${parsed.patch}`);

  // خواندن version.json اگر موجود باشد
  const versionJsonPath = path.join(__dirname, "../version.json");
  if (fs.existsSync(versionJsonPath)) {
    const versionInfo = JSON.parse(fs.readFileSync(versionJsonPath, "utf8"));
    console.log(
      `   Last Update: ${new Date(versionInfo.date).toLocaleString("fa-IR")}`
    );
    console.log(`   Update Type: ${versionInfo.type || "unknown"}`);
    console.log(`   Previous: ${versionInfo.previous || "unknown"}`);
  }
};

// پیش‌نمایش version بعدی
const previewNextVersion = (type = "patch") => {
  const currentVersion = getCurrentVersion();
  const parsed = parseVersion(currentVersion);

  let nextParsed = { ...parsed };

  switch (type) {
    case "major":
      nextParsed.major += 1;
      nextParsed.minor = 0;
      nextParsed.patch = 0;
      break;
    case "minor":
      nextParsed.minor += 1;
      nextParsed.patch = 0;
      break;
    case "patch":
    default:
      nextParsed.patch += 1;
      break;
  }

  const nextVersion = `${nextParsed.major}.${nextParsed.minor}.${nextParsed.patch}`;

  console.log(`🔮 Next Version Preview (${type}):`);
  console.log(`   Current: ${currentVersion}`);
  console.log(`   Next: ${nextVersion}`);
  console.log(`   Change: ${type.toUpperCase()}`);
};

// نمایش تاریخچه version ها
const showVersionHistory = () => {
  const versionJsonPath = path.join(__dirname, "../version.json");

  if (!fs.existsSync(versionJsonPath)) {
    console.log("📜 No version history found.");
    return;
  }

  const versionInfo = JSON.parse(fs.readFileSync(versionJsonPath, "utf8"));

  console.log("📜 Version History:");
  console.log(`   Current: ${versionInfo.version || "unknown"}`);
  console.log(`   Previous: ${versionInfo.previous || "unknown"}`);
  console.log(`   Type: ${versionInfo.type || "unknown"}`);
  console.log(`   Date: ${new Date(versionInfo.date).toLocaleString("fa-IR")}`);
  console.log(`   Timestamp: ${versionInfo.timestamp}`);
};

// راهنمای استفاده
const showHelp = () => {
  console.log("🔧 Version Helper - Usage:");
  console.log("");
  console.log("Commands:");
  console.log(
    "  node scripts/version-helper.js current    - Show current version"
  );
  console.log(
    "  node scripts/version-helper.js preview    - Preview next patch version"
  );
  console.log(
    "  node scripts/version-helper.js preview minor - Preview next minor version"
  );
  console.log(
    "  node scripts/version-helper.js preview major - Preview next major version"
  );
  console.log(
    "  node scripts/version-helper.js history    - Show version history"
  );
  console.log("  node scripts/version-helper.js help       - Show this help");
  console.log("");
  console.log("Version Update Commands:");
  console.log(
    "  npm run version:patch   - Increment patch version (1.0.0 → 1.0.1)"
  );
  console.log(
    "  npm run version:minor   - Increment minor version (1.0.0 → 1.1.0)"
  );
  console.log(
    "  npm run version:major   - Increment major version (1.0.0 → 2.0.0)"
  );
  console.log("  npm run version:show    - Show current version");
};

// اجرای اصلی
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0] || "current";

  switch (command) {
    case "current":
      showCurrentVersion();
      break;
    case "preview":
      const type = args[1] || "patch";
      previewNextVersion(type);
      break;
    case "history":
      showVersionHistory();
      break;
    case "help":
      showHelp();
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
};

// اجرا فقط اگر مستقیماً فراخوانی شده باشد
if (require.main === module) {
  main();
}

module.exports = {
  showCurrentVersion,
  previewNextVersion,
  showVersionHistory,
  showHelp,
};
