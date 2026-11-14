import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  // the Razorpay/Brevo functions in /api only run on Vercel (`vercel dev` locally)
  server: { port: 5173 },
  build: { manifest: true, chunkSizeWarningLimit: 700 },
  ssr: {
    // bundle these into the prerender build so their ESM/CSS imports resolve
    noExternal: ['gsap', '@gsap/react', 'lenis'],
  },
});
