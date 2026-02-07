#!/usr/bin/env node

/**
 * 🧹 Complete Cache Clearing Script
 * پاک کردن کامل و ایمن تمام کش‌های پروژه
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// رنگ‌ها برای console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  }
  return false;
}

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

async function clearAllCache() {
  log("\n🧹 Starting Complete Cache Clearing Process...", "bright");
  log("━".repeat(60), "cyan");

  const results = {
    success: [],
    skipped: [],
    failed: [],
  };

  // 1. Vite Dev Cache
  log("\n📦 Clearing Vite Dev Cache...", "cyan");
  try {
    const viteCachePath = path.join(__dirname, "..", "node_modules", ".vite");
    if (deleteDirectory(viteCachePath)) {
      results.success.push("Vite Dev Cache (node_modules/.vite)");
      log("  ✅ Vite dev cache cleared", "green");
    } else {
      results.skipped.push("Vite Dev Cache (not found)");
      log("  ⏭️  Vite dev cache not found", "yellow");
    }
  } catch (error) {
    results.failed.push(`Vite Dev Cache: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // 2. Build Output
  log("\n🏗️  Clearing Build Output...", "cyan");
  try {
    const distPath = path.join(__dirname, "..", "dist");
    if (deleteDirectory(distPath)) {
      results.success.push("Build Output (dist)");
      log("  ✅ Build output cleared", "green");
    } else {
      results.skipped.push("Build Output (not found)");
      log("  ⏭️  Build output not found", "yellow");
    }
  } catch (error) {
    results.failed.push(`Build Output: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // 3. Vite Cache Files
  log("\n📄 Clearing Vite Cache Files...", "cyan");
  try {
    const cacheFiles = [
      ".vite",
      "vite.config.js.timestamp-*",
      "vite.config.ts.timestamp-*",
    ];

    let cleared = 0;
    cacheFiles.forEach((pattern) => {
      const files = fs
        .readdirSync(path.join(__dirname, ".."))
        .filter((file) => file.match(new RegExp(pattern.replace("*", ".*"))));
      files.forEach((file) => {
        const filePath = path.join(__dirname, "..", file);
        if (deleteFile(filePath) || deleteDirectory(filePath)) {
          cleared++;
        }
      });
    });

    if (cleared > 0) {
      results.success.push(`Vite Cache Files (${cleared} files)`);
      log(`  ✅ ${cleared} cache files cleared`, "green");
    } else {
      results.skipped.push("Vite Cache Files (none found)");
      log("  ⏭️  No cache files found", "yellow");
    }
  } catch (error) {
    results.failed.push(`Vite Cache Files: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // 4. NPM Cache
  log("\n📦 Clearing NPM Cache...", "cyan");
  try {
    execSync("npm cache clean --force", { stdio: "pipe" });
    results.success.push("NPM Cache");
    log("  ✅ NPM cache cleared", "green");
  } catch (error) {
    results.failed.push(`NPM Cache: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // 5. ESLint Cache
  log("\n🔍 Clearing ESLint Cache...", "cyan");
  try {
    const eslintCachePath = path.join(__dirname, "..", ".eslintcache");
    if (deleteFile(eslintCachePath)) {
      results.success.push("ESLint Cache");
      log("  ✅ ESLint cache cleared", "green");
    } else {
      results.skipped.push("ESLint Cache (not found)");
      log("  ⏭️  ESLint cache not found", "yellow");
    }
  } catch (error) {
    results.failed.push(`ESLint Cache: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // 6. TypeScript Cache
  log("\n📘 Clearing TypeScript Cache...", "cyan");
  try {
    const tsCachePath = path.join(__dirname, "..", ".tsbuildinfo");
    if (deleteFile(tsCachePath)) {
      results.success.push("TypeScript Cache");
      log("  ✅ TypeScript cache cleared", "green");
    } else {
      results.skipped.push("TypeScript Cache (not found)");
      log("  ⏭️  TypeScript cache not found", "yellow");
    }
  } catch (error) {
    results.failed.push(`TypeScript Cache: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // 7. Update Cache Version
  log("\n🔄 Updating Cache Version...", "cyan");
  try {
    const cacheManagerPath = path.join(
      __dirname,
      "..",
      "src",
      "utils",
      "cacheManager.js",
    );
    if (fs.existsSync(cacheManagerPath)) {
      let content = fs.readFileSync(cacheManagerPath, "utf8");
      const now = new Date();
      const newVersion = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}.${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

      content = content.replace(
        /this\.APP_VERSION = "[^"]+"/,
        `this.APP_VERSION = "${newVersion}"`,
      );

      fs.writeFileSync(cacheManagerPath, content, "utf8");
      results.success.push(`Cache Version (updated to ${newVersion})`);
      log(`  ✅ Cache version updated to ${newVersion}`, "green");
    } else {
      results.skipped.push("Cache Version (cacheManager.js not found)");
      log("  ⏭️  cacheManager.js not found", "yellow");
    }
  } catch (error) {
    results.failed.push(`Cache Version: ${error.message}`);
    log(`  ❌ Failed: ${error.message}`, "red");
  }

  // Summary
  log("\n" + "━".repeat(60), "cyan");
  log("📊 Summary:", "bright");
  log(`  ✅ Success: ${results.success.length}`, "green");
  log(`  ⏭️  Skipped: ${results.skipped.length}`, "yellow");
  log(`  ❌ Failed: ${results.failed.length}`, "red");

  if (results.success.length > 0) {
    log("\n✅ Successfully Cleared:", "green");
    results.success.forEach((item) => log(`  • ${item}`, "green"));
  }

  if (results.skipped.length > 0) {
    log("\n⏭️  Skipped:", "yellow");
    results.skipped.forEach((item) => log(`  • ${item}`, "yellow"));
  }

  if (results.failed.length > 0) {
    log("\n❌ Failed:", "red");
    results.failed.forEach((item) => log(`  • ${item}`, "red"));
  }

  log("\n" + "━".repeat(60), "cyan");
  log("🎉 Cache clearing process completed!", "bright");
  log("\n💡 Next steps:", "cyan");
  log("  1. Run: npm run dev", "yellow");
  log("  2. Open browser and hard reload (Ctrl+Shift+R)", "yellow");
  log("  3. Clear browser cache from DevTools", "yellow");
  log("\n");
}

// Run the script
clearAllCache().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, "red");
  process.exit(1);
});
