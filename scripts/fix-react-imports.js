#!/usr/bin/env node

/**
 * Script to fix React import patterns across the codebase
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 Fixing React import patterns...");

// Function to recursively find all JS/JSX files
function findFiles(dir, extensions = [".js", ".jsx"]) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Skip node_modules and other build directories
      if (!["node_modules", "dist", ".git", ".vscode"].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Function to fix React imports in a file
function fixReactImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Pattern to match: import React, { hooks... } from 'react';
    const reactImportPattern =
      /import React,\s*\{\s*([^}]+)\s*\}\s*from\s*['"]react['"];/g;

    let modified = false;
    const newContent = content.replace(reactImportPattern, (match, hooks) => {
      modified = true;
      return `import { ${hooks.trim()} } from 'react';`;
    });

    if (modified) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const srcDir = path.join(__dirname, "../src");
const files = findFiles(srcDir);

console.log(`📁 Found ${files.length} JS/JSX files`);

let fixedCount = 0;
files.forEach((file) => {
  if (fixReactImports(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files`);
console.log("✅ React import patterns updated successfully!");
