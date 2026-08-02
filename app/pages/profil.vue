<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="card-base p-6 sm:p-8 space-y-6">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="w-16 h-16 rounded-3xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
          {{ authStore.currentUser?.name?.charAt(0) || 'U' }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            {{ authStore.currentUser?.name }}
            <span 
              class="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full"
              :class="authStore.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ authStore.currentUser?.role }}
            </span>
          </h2>
          <p class="text-xs text-slate-500 font-semibold mt-0.5">@{{ authStore.currentUser?.username }}</p>
        </div>
      </div>

      <!-- Detail Profile Information (PRD Section 9) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
        <div class="space-y-1">
          <span class="text-slate-400 font-bold uppercase tracking-wider">JABATAN</span>
          <p class="text-sm font-bold text-slate-800">{{ authStore.currentUser?.jabatan }}</p>
        </div>

        <div class="space-y-1">
          <span class="text-slate-400 font-bold uppercase tracking-wider">SEKSI</span>
          <p class="text-sm font-bold text-slate-800">{{ authStore.currentUser?.seksi }}</p>
        </div>

        <div class="space-y-1">
          <span class="text-slate-400 font-bold uppercase tracking-wider">LOKASI PENEMPATAN</span>
          <p class="text-sm font-bold text-slate-800">{{ authStore.currentUser?.lokasiPenempatan }}</p>
        </div>

        <div class="space-y-1">
          <span class="text-slate-400 font-bold uppercase tracking-wider">KABUPATEN / KOTA</span>
          <p class="text-sm font-bold text-slate-800">{{ authStore.currentUser?.kabupaten }}</p>
        </div>
      </div>
    </div>

    <!-- Form Ubah Password (PRD Section 9) -->
    <div class="card-base p-6 sm:p-8 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <KeyRound class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">Ubah Password Akun</h3>
          <p class="text-xs text-slate-500">Perbarui kata sandi untuk keamanan akun Anda</p>
        </div>
      </div>

      <form @submit.prevent="handleUpdatePassword" class="space-y-4 pt-2">
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Password Lama *</label>
          <input 
            v-model="oldPassword" 
            type="password" 
            placeholder="Masukkan password saat ini" 
            class="input-base" 
            required 
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Password Baru *</label>
          <input 
            v-model="newPassword" 
            type="password" 
            placeholder="Minimal 6 karakter" 
            class="input-base" 
            required 
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Konfirmasi Password Baru *</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Ulangi password baru" 
            class="input-base" 
            required 
          />
        </div>

        <div class="pt-2">
          <button type="submit" class="btn-primary text-xs py-2.5 px-4 shadow-md shadow-blue-500/20">
            <Save class="w-4 h-4" />
            Simpan Password Baru
          </button>
        </div>
      </form>
    </div>

    <!-- Session & Quick Role Control Card -->
    <div class="card-base p-5 flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <p class="text-xs font-bold text-slate-900">Simulasi Mode Role</p>
        <p class="text-xs text-slate-500">Saat ini aktif sebagai {{ authStore.currentUser?.role }}</p>
      </div>

      <button 
        @click="handleLogout" 
        class="btn-danger text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer shrink-0"
      >
        <LogOut class="w-4 h-4" />
        Keluar Aplikasi
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { KeyRound, Save, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

function handleUpdatePassword() {
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Konfirmasi password baru tidak cocok!')
    return
  }

  const res = authStore.updatePassword(oldPassword.value, newPassword.value)
  if (res.success) {
    toast.success(res.message)
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    toast.error(res.message)
  }
}

function handleLogout() {
  authStore.logout()
  toast.success('Berhasil keluar dari aplikasi.')
  router.push('/login')
}
</script>
