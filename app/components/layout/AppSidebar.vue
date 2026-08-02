<template>
  <aside class="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-61px)] p-4 shrink-0 justify-between">
    <div class="space-y-6">
      <!-- Section Label -->
      <div>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu Utama</p>
        <nav class="space-y-1">
          <NuxtLink 
            to="/" 
            class="sidebar-item"
            :class="{ 'sidebar-item-active': $route.path === '/' }"
          >
            <LayoutDashboard class="w-5 h-5" />
            <span>Dashboard</span>
          </NuxtLink>

          <NuxtLink 
            to="/laporan" 
            class="sidebar-item"
            :class="{ 'sidebar-item-active': $route.path.startsWith('/laporan') && $route.path !== '/laporan/tambah' }"
          >
            <FileText class="w-5 h-5" />
            <span>Daftar Laporan</span>
          </NuxtLink>

          <NuxtLink 
            to="/laporan/tambah" 
            class="sidebar-item text-blue-600 font-semibold"
            :class="{ 'sidebar-item-active': $route.path === '/laporan/tambah' }"
          >
            <PlusCircle class="w-5 h-5" />
            <span>Buat Laporan</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Admin Menu Section -->
      <div v-if="authStore.isAdmin">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Kelola System (Admin)</p>
        <nav class="space-y-1">
          <NuxtLink 
            to="/users" 
            class="sidebar-item"
            :class="{ 'sidebar-item-active': $route.path.startsWith('/users') }"
          >
            <Users class="w-5 h-5" />
            <span>Kelola User</span>
          </NuxtLink>

          <NuxtLink 
            to="/export" 
            class="sidebar-item"
            :class="{ 'sidebar-item-active': $route.path === '/export' }"
          >
            <FileSpreadsheet class="w-5 h-5" />
            <span>Export PDF / Word</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Pengaturan Section -->
      <div>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Pengaturan</p>
        <nav class="space-y-1">
          <NuxtLink 
            to="/profil" 
            class="sidebar-item"
            :class="{ 'sidebar-item-active': $route.path === '/profil' }"
          >
            <User class="w-5 h-5" />
            <span>Profil Saya</span>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Quick Switcher Footer -->
    <div class="border-t border-slate-100 pt-4 space-y-3">
      <div class="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/60">
        <p class="text-xs font-semibold text-slate-700">Mode Role Aktif:</p>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-blue-600 uppercase">{{ authStore.currentUser?.role }}</span>
          <button 
            @click="toggleRole" 
            class="text-[11px] text-slate-600 hover:text-blue-600 font-semibold underline cursor-pointer"
          >
            Ganti ke {{ authStore.isAdmin ? 'User' : 'Admin' }}
          </button>
        </div>
      </div>

      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
      >
        <LogOut class="w-4 h-4" />
        <span>Keluar Aplikasi</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  FileSpreadsheet, 
  User, 
  LogOut 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

function toggleRole() {
  const newRole = authStore.isAdmin ? 'user' : 'admin'
  authStore.quickLogin(newRole)
  toast.info(`Beralih ke role ${newRole.toUpperCase()}`)
}

function handleLogout() {
  authStore.logout()
  toast.success('Berhasil logout')
  router.push('/login')
}
</script>

<style scoped>
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.15s ease-in-out;
}
.sidebar-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}
.sidebar-item-active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}
</style>
