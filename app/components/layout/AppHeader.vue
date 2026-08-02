<template>
  <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Left: Logo & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          J
        </div>
        <div>
          <h1 class="font-bold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-2">
            Jurnal DSDA
            <span 
              class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
              :class="authStore.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ authStore.currentUser?.role || 'User' }}
            </span>
          </h1>
          <p class="text-xs text-slate-500 hidden sm:block">Dinas Sumber Daya Air</p>
        </div>
      </div>

      <!-- Right Actions: PWA Install + Profile Dropdown -->
      <div class="flex items-center gap-2.5">
        <!-- Quick Switch Demo Role Button -->
        <button 
          @click="toggleRole" 
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          title="Klik untuk simulasi perpindahan role Admin <-> User"
        >
          <Repeat class="w-3.5 h-3.5" />
          Switch Role ({{ authStore.isAdmin ? 'Admin' : 'Pegawai' }})
        </button>

        <NuxtLink 
          to="/profil"
          class="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-2xl transition"
        >
          <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-semibold flex items-center justify-center border border-slate-200 text-sm">
            {{ authStore.currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div class="text-left hidden md:block pr-1">
            <p class="text-xs font-bold text-slate-900 truncate max-w-[140px]">{{ authStore.currentUser?.name }}</p>
            <p class="text-[11px] text-slate-500 truncate max-w-[140px]">{{ authStore.currentUser?.jabatan }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { Repeat } from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()

function toggleRole() {
  const newRole = authStore.isAdmin ? 'user' : 'admin'
  authStore.quickLogin(newRole)
  toast.info(`Berhasil beralih ke role ${newRole.toUpperCase()}`)
}
</script>
