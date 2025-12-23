import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, ".", "");

  console.log("🔧 Vite Build Configuration:");
  console.log("Mode:", mode);
  console.log("Command:", command);
  console.log("VITE_API_BASE_URL:", env.VITE_API_BASE_URL);

  return {
    plugins: [react()],
    build: {
      // Optimize bundle size
      rollupOptions: {
        output: {
          // Cache busting با timestamp برای هر دیپلوی جدید
          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
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
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "lucide-react"],
    },
    // Define environment variables
    define: {
      __VITE_API_BASE_URL__: JSON.stringify(
        env.VITE_API_BASE_URL || "https://api.pardistous.ir"
      ),
      __VITE_APP_NAME__: JSON.stringify(env.VITE_APP_NAME || "Pardis Client"),
      __VITE_APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0"),
    },
    // Environment configuration
    envDir: "./",
    envPrefix: "VITE_",
  };
});
