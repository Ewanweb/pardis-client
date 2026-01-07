#!/usr/bin/env node

// Script برای چک کردن environment variables قبل از build

import fs from "fs";
import path from "path";

// تابع برای خواندن فایل .env
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  content.split("\n").forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#") && line.includes("=")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      env[key.trim()] = value;
    }
  });

  return env;
}

console.log("🔧 Checking environment configuration...\n");

// چک کردن فایل‌های env
const envFiles = [".env", ".env.production", ".env.development"];
const existingEnvFiles = envFiles.filter((file) => fs.existsSync(file));

console.log("📁 Environment files found:");
existingEnvFiles.forEach((file) => {
  console.log(`  ✅ ${file}`);
});

if (existingEnvFiles.length === 0) {
  console.log("  ❌ No environment files found!");
}

// بارگذاری متغیرهای محیطی از فایل‌ها
const envVars = {};

// بارگذاری .env اصلی
Object.assign(envVars, loadEnvFile(".env"));

// بارگذاری .env.production اگر NODE_ENV=production باشد
if (process.env.NODE_ENV === "production") {
  Object.assign(envVars, loadEnvFile(".env.production"));
}

console.log("\n📋 Environment variables:");

// چک کردن متغیرهای محیطی
// Note: API URL is now managed in src/services/api.js
const requiredVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
};

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`  ✅ ${key}: ${value}`);
  } else {
    console.log(`  ❌ ${key}: Not set`);
  }
});

// خواندن فایل .env.production
if (fs.existsSync(".env.production")) {
  console.log("\n📄 .env.production content:");
  const prodEnvContent = fs.readFileSync(".env.production", "utf8");
  console.log(prodEnvContent);
}

// بررسی فایل api.js
const apiFilePath = "src/services/api.js";
if (fs.existsSync(apiFilePath)) {
  console.log("\n🔍 Checking api.js configuration...");
  const apiContent = fs.readFileSync(apiFilePath, "utf8");

  // استخراج DEFAULT_API_URL از api.js
  const defaultUrlMatch = apiContent.match(/this\.DEFAULT_API_URL\s*=\s*["']([^"']+)["']/);
  if (defaultUrlMatch) {
    const defaultUrl = defaultUrlMatch[1];
    console.log(`  ✅ DEFAULT_API_URL: ${defaultUrl}`);
    
    if (defaultUrl.includes("localhost")) {
      console.log("  ⚠️  Warning: Using localhost API URL");
    } else if (defaultUrl.includes("api.pardistous.ir")) {
      console.log("  ✅ Production API URL configured");
    }
  } else {
    console.log("  ❌ Could not find DEFAULT_API_URL in api.js");
  }
}

// تولید گزارش
console.log("\n📊 Build Configuration Summary:");
console.log("================================");

const isProduction =
  process.env.NODE_ENV === "production" ||
  requiredVars.NODE_ENV === "production";

// بررسی API URL از api.js
let apiUrl = "Not found";
if (fs.existsSync(apiFilePath)) {
  const apiContent = fs.readFileSync(apiFilePath, "utf8");
  const defaultUrlMatch = apiContent.match(/this\.DEFAULT_API_URL\s*=\s*["']([^"']+)["']/);
  if (defaultUrlMatch) {
    apiUrl = defaultUrlMatch[1];
  }
}

console.log(
  `Environment: ${isProduction ? "✅ Production" : "⚠️  Development"}`
);
console.log(`API URL (from api.js): ${apiUrl}`);

// برای production build
if (isProduction) {
  console.log("\n🚀 Ready for production build!");
  console.log("💡 Note: API URL is managed in src/services/api.js");
  process.exit(0);
} else {
  console.log("\n💡 Development environment detected");
  console.log("💡 Note: API URL is managed in src/services/api.js");
  console.log("   Update DEFAULT_API_URL in src/services/api.js to change API URL");
  process.exit(0);
}
