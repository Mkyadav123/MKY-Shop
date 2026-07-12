import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        // Forward /api/* → http://localhost/backend/index.php/api/*
        // index.php strips the prefix and dispatches by route.
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => '/backend/index.php' + path,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks(
          id
        ) {
          /* MUI */

          if (
            id.includes(
              "@mui"
            )
          ) {
            return "mui";
          }

          /* FRAMER */

          if (
            id.includes(
              "framer-motion"
            )
          ) {
            return "motion";
          }

          /* PDF */

          if (
            id.includes(
              "jspdf"
            ) ||
            id.includes(
              "html2canvas"
            )
          ) {
            return "pdf";
          }
        },
      },
    },
  },
});