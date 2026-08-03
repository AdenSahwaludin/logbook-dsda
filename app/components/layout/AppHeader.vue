<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-6">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Left: Logo & Title -->
      <div class="flex items-center gap-3">
        <img src="/icon.png" alt="Logo" class="w-10 h-10 rounded-2xl object-cover shadow-xs border border-slate-100" />
        <div>
          <h1 class="font-bold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-2">
            Logbook Bulanan
            <ClientOnly>
              <span 
                class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                :class="authStore.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
              >
                {{ authStore.currentUser?.role || 'User' }}
              </span>
            </ClientOnly>
          </h1>
        </div>
      </div>

      <!-- Right Actions: Profile Link -->
      <div class="flex items-center gap-2.5">
        <NuxtLink 
          to="/profil"
          class="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-2xl transition"
        >
          <ClientOnly>
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-100 text-sm">
              {{ authStore.currentUser?.name?.charAt(0) || 'U' }}
            </div>
            <div class="text-left hidden md:block pr-1">
              <p class="text-xs font-bold text-slate-900 truncate max-w-[140px]">{{ authStore.currentUser?.name }}</p>
              <p class="text-[11px] text-slate-500 truncate max-w-[140px]">{{ authStore.currentUser?.jabatan }}</p>
            </div>
          </ClientOnly>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
</script>
