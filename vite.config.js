import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/jkzs_ll/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192x192.svg'],
      manifest: {
        name: '懒懒健康助手',
        short_name: '懒懒助手',
        description: '以陨石边牧懒懒为核心的健康管理助手',
        theme_color: '#5B9BD5',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ]
})
