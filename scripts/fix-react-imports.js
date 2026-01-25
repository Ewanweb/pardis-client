#!/usr/bin/env node

/**
 * Script to ensure consistent React imports across the project
 * This prevents "Cannot read properties of null (reading 'useState')" errors
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, "../src");

console.log("🔧 Fixing React imports...");

function fixReactImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixReactImports(filePath);
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      const content = fs.readFileSync(filePath, "utf8");

      // Check if file uses React hooks but doesn't import React
      const usesHooks =
        /use(State|Effect|Context|Callback|Memo|Ref|Reducer|LayoutEffect)/.test(
          content
        );
      const hasReactImport = /import\s+React/.test(content);
      const hasHookImport =
        /import\s*{[^}]*use(State|Effect|Context|Callback|Memo|Ref|Reducer|LayoutEffect)/.test(
          content
        );

      if (usesHooks && hasHookImport && !hasReactImport) {
        console.log(`📝 Fixing ${filePath}`);

        // Replace hook-only imports with React + hooks imports
        const fixedContent = content.replace(
          /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"];?/,
          'import React, { $1 } from "react";'
        );

        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent, "utf8");
          console.log(`✅ Fixed ${filePath}`);
        }
      }
    }
  });
}

fixReactImports(srcDir);
console.log("✅ React imports fixed!");
