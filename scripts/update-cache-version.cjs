#!/usr/bin/env node

/**
 * 🔄 اسکریپت به‌روزرسانی خودکار نسخه کش
 * این اسکریپت قبل از هر build اجرا میشه و version کش رو به‌روزرسانی میکنه
 */

const fs = require("fs");
const path = require("path");

// مسیر فایل cacheManager
const cacheManagerPath = path.join(__dirname, "../src/utils/cacheManager.js");

// تولید version جدید بر اساس تاریخ و زمان فعلی
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const hour = String(now.getHours()).padStart(2, "0");
const minute = String(now.getMinutes()).padStart(2, "0");

const newVersion = `${year}.${month}.${day}.${hour}${minute}`;

try {
  // خواندن فایل cacheManager
  let content = fs.readFileSync(cacheManagerPath, "utf8");

  // جایگزینی version قدیمی با جدید
  const versionRegex = /this\.APP_VERSION = "[^"]+";/;
  const newVersionLine = `this.APP_VERSION = "${newVersion}";`;

  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, newVersionLine);

    // نوشتن فایل به‌روزرسانی شده
    fs.writeFileSync(cacheManagerPath, content, "utf8");

    console.log(`✅ Cache version updated to: ${newVersion}`);
    console.log(`📁 File: ${cacheManagerPath}`);
  } else {
    console.error("❌ Could not find APP_VERSION in cacheManager.js");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error updating cache version:", error.message);
  process.exit(1);
}
