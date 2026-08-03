<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
    <div class="grid grid-cols-5 items-center w-full max-w-md mx-auto text-center">
      <!-- 1. Beranda -->
      <NuxtLink 
        to="/" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/' }"
      >
        <LayoutDashboard class="w-5 h-5" />
        <span class="truncate w-full">Beranda</span>
      </NuxtLink>

      <!-- 2. Laporan -->
      <NuxtLink 
        to="/laporan" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path.startsWith('/laporan') && $route.path !== '/laporan/tambah' }"
      >
        <FileText class="w-5 h-5" />
        <span class="truncate w-full">Laporan</span>
      </NuxtLink>

      <!-- 3. Center Action: Tambah Laporan (Perfect Symmetrical Center) -->
      <NuxtLink 
        to="/laporan/tambah" 
        class="flex flex-col items-center justify-center relative -top-3 cursor-pointer"
      >
        <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition">
          <Plus class="w-6 h-6" />
        </div>
        <span class="text-[10px] font-bold text-blue-600 mt-0.5">Tambah</span>
      </NuxtLink>

      <!-- 4. Export (Admin) or Profil (User) -->
      <NuxtLink 
        v-if="authStore.isAdmin"
        to="/export" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/export' }"
      >
        <FileSpreadsheet class="w-5 h-5" />
        <span class="truncate w-full">Export</span>
      </NuxtLink>
      <NuxtLink 
        v-else
        to="/profil" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path === '/profil' }"
      >
        <User class="w-5 h-5" />
        <span class="truncate w-full">Profil</span>
      </NuxtLink>

      <!-- 5. Users (Admin) or Logout (User) -->
      <NuxtLink 
        v-if="authStore.isAdmin"
        to="/users" 
        class="mobile-nav-item"
        :class="{ 'mobile-nav-active': $route.path.startsWith('/users') }"
      >
        <Users class="w-5 h-5" />
        <span class="truncate w-full">Users</span>
      </NuxtLink>
      <button 
        v-else
        @click="handleLogout" 
        class="mobile-nav-item text-red-500 hover:text-red-700 cursor-pointer"
      >
        <LogOut class="w-5 h-5" />
        <span class="truncate w-full">Keluar</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  FileSpreadsheet, 
  User, 
  Users,
  LogOut
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  toast.success('Berhasil keluar dari aplikasi.')
  router.push('/login')
}
</script>

<style scoped>
.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #64748b;
  padding: 0.25rem 0.1rem;
  transition: color 0.15s ease-in-out;
  width: 100%;
}
.mobile-nav-active {
  color: #2563eb;
  font-weight: 700;
}
</style>
