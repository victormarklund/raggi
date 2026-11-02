import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

const OAT = '#F3EEE6';

// RAGGI_DEV_ALLOWED_HOSTS: comma-separated hostnames, or "true" to allow any.
const allowedHostsEnv = process.env.RAGGI_DEV_ALLOWED_HOSTS?.trim();
const allowedHosts =
  allowedHostsEnv === 'true'
    ? true
    : allowedHostsEnv
      ? allowedHostsEnv.split(',').map((h) => h.trim()).filter(Boolean)
      : undefined;

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'splash/*.png'],
      manifest: {
        name: 'Raggi',
        short_name: 'Raggi',
        description: 'A calm row counter for knitting and crochet.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: OAT,
        theme_color: OAT,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,mp4}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts,
    watch: process.env.CHOKIDAR_USEPOLLING === 'true' ? { usePolling: true, interval: 300 } : undefined
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
