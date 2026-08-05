import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Logbook Bulanan',
      short_name: 'Logbook Bulanan',
      description: 'Aplikasi PWA Laporan Presensi & Logbook Kegiatan Harian Pegawai',
      theme_color: '#FFFFFF',
      background_color: '#FFFFFF',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: null,
      navigateFallbackDenylist: [/^\/api\//]
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: false
    }
  },

  app: {
    head: {
      title: 'Logbook Bulanan',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#FFFFFF' },
        { name: 'description', content: 'Aplikasi Laporan Presensi & Logbook Kegiatan Harian Pegawai' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'shortcut icon', href: '/icon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' }
      ]
    }
  }
})
