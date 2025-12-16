import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

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
    },
    // Environment configuration
    envDir: "./",
    envPrefix: "VITE_",
  };
});
