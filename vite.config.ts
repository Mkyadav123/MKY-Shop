import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/backend/index.php',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          });
        }
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