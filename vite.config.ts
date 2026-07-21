import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: https://oossccaa.github.io/walkthrough/
export default defineConfig({
  base: '/walkthrough/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tiedto',
        short_name: 'Tiedto',
        description: '記下身邊每個人的喜好與大小事',
        lang: 'zh-TW',
        display: 'standalone',
        theme_color: '#6489c2',
        background_color: '#f4f7fb',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
