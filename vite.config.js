import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, ".", "");

  console.log("🔧 Vite Build Configuration:");
  console.log("Mode:", mode);
  console.log("Command:", command);
  // Note: API URL is now managed centrally in src/services/api.js

  return {
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
      alias: {
        // Force single React instance
        react: path.resolve("./node_modules/react"),
        "react-dom": path.resolve("./node_modules/react-dom"),
      },
    },
    build: {
      // Optimize bundle size
      rollupOptions: {
        output: {
          // Cache busting بهتر - فقط از hash استفاده کنیم
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes("node_modules")) {
              const reactDeps = [
                "react",
                "react-dom",
                "scheduler",
                "object-assign",
                "loose-envify",
                "use-sync-external-store",
              ];
              if (
                reactDeps.some((pkg) => id.includes(`/node_modules/${pkg}/`))
              ) {
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
      // Optimize chunk size
      chunkSizeWarningLimit: 500,
      // Disable source maps for production
      sourcemap: false,
    },
    server: {
      // Enable compression
      compress: true,
      port: 3000,
      host: "0.0.0.0",
      // Alternative ports if 3000 is busy
      strictPort: false,
      // Try different ports automatically
      open: true,
      // History API fallback for SPA routing
      historyApiFallback: true,
      proxy: {
        "/swagger": {
          target: "https://api.pardistous.ir",
          changeOrigin: true,
          secure: false, // For localhost self-signed certs
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "lucide-react"],
    },
    // Define environment variables
    define: {
      // Note: API URL is now managed centrally in src/services/api.js
      __VITE_APP_NAME__: JSON.stringify("آکادمی پردیس توس"),
      __VITE_APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0"),
    },
    // Environment configuration
    envDir: "./",
    envPrefix: "VITE_",
  };
});
