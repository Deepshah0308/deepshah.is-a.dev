import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from the custom domain root (deepshah.is-a.dev), so base stays "/".
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // three.js only loads with the lazy hero canvas; it is big by nature
  build: { chunkSizeWarningLimit: 1100 }
});
