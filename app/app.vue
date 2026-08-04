<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

useHead({
  title: 'Logbook Bulanan',
  link: [
    { rel: 'icon', type: 'image/png', href: '/icon.png' }
  ]
})
</script>
