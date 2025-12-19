#!/usr/bin/env node

// Quick test script to verify API configuration logic

console.log("🧪 Testing API Configuration Logic\n");

// Mock different environments
const testCases = [
  {
    name: "Development - Localhost",
    env: {
      MODE: "development",
      VITE_API_BASE_URL: "http://localhost:5000",
      hostname: "localhost",
    },
    expected: "http://localhost:5000",
  },
  {
    name: "Production Build - Localhost",
    env: {
      MODE: "production",
      VITE_API_BASE_URL: "http://localhost:5000",
      hostname: "localhost",
    },
    expected: "https://api.pardistous.ir",
  },
  {
    name: "Production Domain",
    env: {
      MODE: "development",
      VITE_API_BASE_URL: "http://localhost:5000",
      hostname: "app.pardistous.ir",
    },
    expected: "https://api.pardistous.ir",
  },
  {
    name: "Production Environment Variable",
    env: {
      MODE: "development",
      VITE_API_BASE_URL: "https://api.pardistous.ir",
      hostname: "localhost",
    },
    expected: "https://api.pardistous.ir",
  },
  {
    name: "Unknown Domain (not localhost)",
    env: {
      MODE: "development",
      VITE_API_BASE_URL: "http://localhost:5000",
      hostname: "example.com",
    },
    expected: "https://api.pardistous.ir",
  },
];

// Test each case
testCases.forEach((testCase) => {
  console.log(`📋 Testing: ${testCase.name}`);

  const PRODUCTION_API_URL = "https://api.pardistous.ir";

  const isLocalhost =
    testCase.env.hostname === "localhost" ||
    testCase.env.hostname === "127.0.0.1" ||
    testCase.env.hostname.includes("192.168.") ||
    testCase.env.hostname === "[::1]";

  const isProductionBuild = testCase.env.MODE === "production";

  const isProductionDomain =
    testCase.env.hostname.includes("pardistous.ir") ||
    testCase.env.hostname.includes("production") ||
    !isLocalhost;

  const shouldUseProductionAPI =
    isProductionDomain ||
    isProductionBuild ||
    testCase.env.VITE_API_BASE_URL === PRODUCTION_API_URL ||
    !isLocalhost;

  const SERVER_URL = shouldUseProductionAPI
    ? PRODUCTION_API_URL
    : testCase.env.VITE_API_BASE_URL || "http://localhost:5000";

  const passed = SERVER_URL === testCase.expected;

  console.log(`   Hostname: ${testCase.env.hostname}`);
  console.log(`   Mode: ${testCase.env.MODE}`);
  console.log(`   Is Localhost: ${isLocalhost}`);
  console.log(`   Is Production Build: ${isProductionBuild}`);
  console.log(`   Is Production Domain: ${isProductionDomain}`);
  console.log(`   Should Use Production API: ${shouldUseProductionAPI}`);
  console.log(`   Result: ${SERVER_URL}`);
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   ${passed ? "✅ PASSED" : "❌ FAILED"}\n`);
});

console.log("🎯 Test Summary:");
console.log("All test cases should pass with the new bulletproof logic!");
