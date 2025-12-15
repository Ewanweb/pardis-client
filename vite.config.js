import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("react-router")) {
              return "router";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("@tiptap") || id.includes("prosemirror")) {
              return "editor";
            }
            if (id.includes("axios")) {
              return "http";
            }
            return "vendor";
          }

          // Admin pages chunk
          if (id.includes("/pages/admin/")) {
            return "admin";
          }

          // Auth pages chunk
          if (id.includes("/pages/auth/")) {
            return "auth";
          }

          // Components chunk
          if (id.includes("/components/")) {
            return "components";
          }
        },
      },
    },
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Disable source maps for production
    sourcemap: false,
  },
  server: {
    // Enable compression
    compress: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "lucide-react"],
  },
});
