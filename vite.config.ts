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
        name: '戀愛攻略筆記',
        short_name: '攻略筆記',
        description: '約會前 30 秒速查的個人戀愛筆記',
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
