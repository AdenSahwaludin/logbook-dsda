<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
    <div class="card-base w-full max-w-md p-6 sm:p-8 space-y-6 shadow-xl">
      <!-- Header / Logo -->
      <div class="text-center space-y-2">
        <img src="/icon.png" alt="DSDA Logo" class="w-16 h-16 rounded-3xl object-cover mx-auto shadow-md shadow-blue-500/20" />
        <h1 class="text-xl font-bold text-slate-900">Sistem Jurnal Harian</h1>
        <p class="text-xs text-slate-500">Dinas Sumber Daya Air (PWA)</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Username</label>
          <div class="relative">
            <input 
              v-model="form.username" 
              type="text" 
              placeholder="Masukkan username" 
              class="input-base input-has-icon-left"
              required 
            />
            <User class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Password</label>
          <div class="relative">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Masukkan password" 
              class="input-base input-has-icon-left input-has-icon-right"
              required 
            />
            <Lock class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          class="btn-primary w-full shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          :disabled="isLoading"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <span>{{ isLoading ? 'Memverifikasi ke Database...' : 'Masuk ke Aplikasi' }}</span>
        </button>
      </form>

      <!-- Real DB Credentials Hint & Quick Fill -->
      <div class="border-t border-slate-200 pt-5 space-y-3">
        <p class="text-center text-xs font-semibold text-slate-500">Akun Database (Turso SQLite):</p>
        <div class="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            @click="fillCredentials('karnadi', 'karnadi')"
            class="btn-secondary text-xs py-2.5 px-3 border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-800 flex flex-col items-center"
          >
            <span class="font-bold">Pegawai (Karnadi)</span>
            <span class="text-[10px] text-blue-600">karnadi / karnadi</span>
          </button>
          <button 
            type="button" 
            @click="fillCredentials('adensah', 'adensah')"
            class="btn-secondary text-xs py-2.5 px-3 border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-800 flex flex-col items-center"
          >
            <span class="font-bold">Admin (AdenSah)</span>
            <span class="text-[10px] text-purple-600">adensah / adensah</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const form = ref({
  username: '',
  password: ''
})
const showPassword = ref(false)
const isLoading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    toast.error('Username dan password wajib diisi!')
    return
  }

  isLoading.value = true
  try {
    const res = await authStore.login(form.value.username, form.value.password)
    isLoading.value = false
    if (res.success) {
      toast.success(res.message)
      router.push('/')
    } else {
      toast.error(res.message)
    }
  } catch (err: any) {
    isLoading.value = false
    toast.error('Gagal terhubung ke database server.')
  }
}

function fillCredentials(user: string, pass: string) {
  form.value.username = user
  form.value.password = pass
}
</script>
