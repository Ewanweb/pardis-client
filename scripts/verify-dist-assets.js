#!/usr/bin/env node

import fs from "fs";
import path from "path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");

console.log("🔍 Checking dist/index.html asset references...");

if (!fs.existsSync(indexPath)) {
  console.error("❌ dist/index.html not found. Run `npm run build` first.");
  process.exit(1);
}

const html = fs.readFileSync(indexPath, "utf8");
const assetMatches = new Set();

// Capture modulepreload/href/src attributes pointing to assets/
const assetRegex = /(?:href|src)=["']([^"']+assets\/[^"'>\\s]+)["']/gi;
let match;
while ((match = assetRegex.exec(html)) !== null) {
  const rawPath = match[1];
  const cleaned = rawPath.replace(/^[/.]*/, "");
  if (cleaned.startsWith("assets/")) {
    assetMatches.add(cleaned);
  }
}

const missing = [];
for (const assetPath of assetMatches) {
  const fullPath = path.join(distDir, assetPath);
  if (!fs.existsSync(fullPath)) {
    missing.push(assetPath);
  }
}

if (missing.length) {
  console.error("❌ Missing assets referenced from index.html:");
  for (const file of missing) {
    console.error(`   - ${file}`);
  }
  process.exit(1);
}

console.log("✅ All referenced assets are present in dist/assets");
