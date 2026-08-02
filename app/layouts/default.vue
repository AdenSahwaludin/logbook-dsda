<template>
  <div class="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-700">
    <ToastContainer />
    
    <!-- Top Header -->
    <AppHeader />

    <!-- Main Container -->
    <div class="flex-1 flex max-w-7xl w-full mx-auto">
      <!-- Desktop Sidebar -->
      <AppSidebar />

      <!-- Content Area -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-full overflow-x-hidden">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <AppMobileNav />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppMobileNav from '~/components/layout/AppMobileNav.vue'
import ToastContainer from '~/components/common/ToastContainer.vue'
import { useAuthStore } from '~/stores/auth'
import { useLaporanStore } from '~/stores/laporan'
import { useUsersStore } from '~/stores/users'

const authStore = useAuthStore()
const laporanStore = useLaporanStore()
const usersStore = useUsersStore()

onMounted(() => {
  authStore.initAuth()
  laporanStore.initLaporan()
  usersStore.initUsers()
})
</script>
