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
    foundLocalhostAPI = true;
    console.log(`⚠️  Localhost API URL found in: ${file}`);

    // Show a snippet of the problematic content for debugging
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].includes("localhost") ||
        lines[i].includes("127.0.0.1") ||
        lines[i].includes("192.168.")
      ) {
        console.log(`   Line ${i + 1}: ${lines[i].trim()}`);
      }
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
