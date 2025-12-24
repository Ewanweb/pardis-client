#!/usr/bin/env node

// Script برای verify کردن build output

import fs from "fs";
import path from "path";

console.log("🔍 Verifying build output...\n");

// بررسی وجود فولدر dist
if (!fs.existsSync("dist")) {
  console.log("❌ dist folder not found!");
  process.exit(1);
}

// خواندن فایل‌های JavaScript در dist
function findJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (item.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const jsFiles = findJSFiles("dist");
console.log(`📁 Found ${jsFiles.length} JavaScript files in build`);

let foundProductionAPI = false;
let foundLocalhostAPI = false;

// بررسی محتوای فایل‌ها
for (const file of jsFiles) {
  const content = fs.readFileSync(file, "utf8");

  if (content.includes("api.pardistous.ir")) {
    foundProductionAPI = true;
    console.log(`✅ Production API URL found in: ${file}`);
  }

  if (
    content.includes("localhost:44367") ||
    content.includes("localhost:5000") ||
    content.includes("localhost:3000") ||
    content.includes("127.0.0.1") ||
    content.includes("192.168.")
  ) {
    // Check if this is legitimate development detection code
    const lines = content.split("\n");
    let isLegitimateDevCode = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes("localhost") ||
        line.includes("127.0.0.1") ||
        line.includes("192.168.")
      ) {
        // Check if this is legitimate development detection code
        if (
          line.includes("window.location.hostname") ||
          line.includes("hostname.includes") ||
          line.includes("hostname.startsWith") ||
          line.includes("isDevelopment") ||
          line.includes("isLocal") ||
          line.includes("development") ||
          line.includes("dev") ||
          line.includes("port ===") ||
          line.includes("location.port")
        ) {
          isLegitimateDevCode = true;
          console.log(`ℹ️  Development detection code found in: ${file}`);
          console.log(`   Line ${i + 1}: ${line.trim()}`);
        } else {
          // This looks like an actual API call to localhost
          foundLocalhostAPI = true;
          console.log(`⚠️  Localhost API URL found in: ${file}`);
          console.log(`   Line ${i + 1}: ${line.trim()}`);
        }
      }
    }

    // If it's only legitimate dev detection code, don't count it as a problem
    if (!isLegitimateDevCode) {
      foundLocalhostAPI = true;
    }
  }
}

// نتیجه‌گیری
console.log("\n📊 Build Verification Results:");
console.log("================================");

if (foundProductionAPI) {
  console.log("✅ Production API URL: Found");
} else {
  console.log("❌ Production API URL: NOT Found");
}

if (foundLocalhostAPI) {
  console.log("⚠️  Localhost API URL: Found (should not be in production)");
} else {
  console.log("✅ Localhost API URL: Not found (good)");
}

// بررسی فایل debug
if (fs.existsSync("dist/debug-api.html")) {
  console.log("✅ Debug file: Available at /debug-api.html");
} else {
  console.log("⚠️  Debug file: Not found");
}

// خروج با کد مناسب
if (foundProductionAPI && !foundLocalhostAPI) {
  console.log("\n🚀 Build verification PASSED!");
  process.exit(0);
} else {
  console.log("\n❌ Build verification FAILED!");
  process.exit(1);
}
