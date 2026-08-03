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
      name: 'Logbook DSDA',
      short_name: 'Logbook DSDA',
      description: 'Aplikasi PWA Laporan Jurnal Kegiatan Harian Pegawai',
      theme_color: '#2563EB',
      background_color: '#F8FAFC',
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
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: true
    }
  },

  app: {
    head: {
      title: 'Logbook DSDA',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#2563EB' },
        { name: 'description', content: 'Aplikasi Laporan Jurnal Kegiatan Harian Pegawai berbasis PWA' }
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
