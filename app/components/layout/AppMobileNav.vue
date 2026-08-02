<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2">
    <div class="flex items-center justify-around max-w-md mx-auto">
      <NuxtLink 
        to="/" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/' }"
      >
        <LayoutDashboard class="w-5 h-5" />
        <span>Beranda</span>
      </NuxtLink>

      <NuxtLink 
        to="/laporan" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/laporan' }"
      >
        <FileText class="w-5 h-5" />
        <span>Laporan</span>
      </NuxtLink>

      <!-- Center Action: Buat Laporan (Big Button) -->
      <NuxtLink 
        to="/laporan/tambah" 
        class="flex flex-col items-center justify-center relative -top-3"
      >
        <div class="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition">
          <Plus class="w-7 h-7" />
        </div>
        <span class="text-[10px] font-bold text-blue-600 mt-0.5">Tambah</span>
      </NuxtLink>

      <NuxtLink 
        v-if="authStore.isAdmin"
        to="/export" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/export' }"
      >
        <FileSpreadsheet class="w-5 h-5" />
        <span>Export</span>
      </NuxtLink>

      <NuxtLink 
        v-else
        to="/profil" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/profil' }"
      >
        <User class="w-5 h-5" />
        <span>Profil</span>
      </NuxtLink>

      <NuxtLink 
        v-if="authStore.isAdmin"
        to="/users" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/users' }"
      >
        <Users class="w-5 h-5" />
        <span>Users</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { LayoutDashboard, FileText, Plus, FileSpreadsheet, User, Users } from 'lucide-vue-next'

const authStore = useAuthStore()
</script>

<style scoped>
.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  transition: color 0.15s ease-in-out;
}
.mobile-nav-active {
  color: #2563eb;
  font-weight: 700;
}
</style>
