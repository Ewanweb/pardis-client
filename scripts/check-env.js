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
const requiredVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || envVars.VITE_API_BASE_URL,
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

  // چک کردن fallback URL
  if (apiContent.includes("localhost:44367")) {
    console.log("  ⚠️  Warning: localhost fallback found in api.js");
  }

  if (apiContent.includes("api.pardistous.ir")) {
    console.log("  ✅ Production API URL found in api.js");
  }
}

// تولید گزارش
console.log("\n📊 Build Configuration Summary:");
console.log("================================");

const isProduction =
  process.env.NODE_ENV === "production" ||
  requiredVars.NODE_ENV === "production";
const hasProductionAPI =
  requiredVars.VITE_API_BASE_URL === "https://api.pardistous.ir";

console.log(
  `Environment: ${isProduction ? "✅ Production" : "⚠️  Development"}`
);
console.log(
  `API URL: ${hasProductionAPI ? "✅ Production API" : "❌ Wrong API URL"}`
);

// در محیط محلی، فقط بررسی کن که فایل‌ها درست تنظیم شده‌اند
if (!process.env.NODE_ENV) {
  console.log("\n💡 Local environment detected");
  console.log(
    "Checking if files are configured correctly for production build..."
  );

  const prodEnv = loadEnvFile(".env.production");
  const hasCorrectProdAPI =
    prodEnv.VITE_API_BASE_URL === "https://api.pardistous.ir";

  if (hasCorrectProdAPI) {
    console.log("✅ Production configuration is correct!");
    console.log("🚀 Ready for production build!");
    process.exit(0);
  } else {
    console.log("❌ Production configuration issues detected!");
    process.exit(1);
  }
}

// برای production build
if (isProduction && hasProductionAPI) {
  console.log("\n🚀 Ready for production build!");
  process.exit(0);
} else {
  console.log("\n❌ Configuration issues detected!");
  if (!isProduction) {
    console.log('  - NODE_ENV should be "production"');
  }
  if (!hasProductionAPI) {
    console.log('  - VITE_API_BASE_URL should be "https://api.pardistous.ir"');
  }
  process.exit(1);
}
