import { defineConfig } from "vite";

// Vite configuration to proxy API requests to the backend
export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Ensure this is the backend's port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
