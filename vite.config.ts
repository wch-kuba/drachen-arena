import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Drachenhort palette (DESIGN.md): grotto rock.
const THEME = '#072830'
const BACKGROUND = '#072830'

export default defineConfig({
  define: {
    __APP_BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Drachen-Arena',
        short_name: 'Drachen',
        description: 'Deutsch lernen, Drachen sammeln und Abenteuer erleben!',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // iPad is the main device and is used in both orientations.
        orientation: 'any',
        theme_color: THEME,
        background_color: BACKGROUND,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache everything so the app runs fully offline after first load.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,mp3,json}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
