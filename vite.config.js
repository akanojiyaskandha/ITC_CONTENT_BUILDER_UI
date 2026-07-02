import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

// import path from "path";
// import react from "@vitejs/plugin-react";
// import { defineConfig, loadEnv } from "vite";

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), "");

//   const backendOrigin = (() => {
//     const u = new URL(env.VITE_LTS_API_URL);
//     return `${u.protocol}//${u.host}`;
//   })();

//   return {
//     plugins: [react()],
//     resolve: {
//       alias: {
//         "@": path.resolve(__dirname, "./src"),
//       },
//     },
//     server: {
//       port: 5173,
//       proxy: {
//         "/api/v1": {
//           target: backendOrigin,
//           changeOrigin: true,
//           secure: false,
//         },
//       },
//     },
//   };
// });
