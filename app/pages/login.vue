<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
    <ToastContainer />

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
          class="btn-primary w-full shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          :disabled="isLoading"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Aplikasi' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import ToastContainer from '~/components/common/ToastContainer.vue'
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
      toast.success(res.message || 'Login berhasil!')
      router.push('/')
    } else {
      toast.error(res.message || 'Username atau password salah!')
    }
  } catch (err: any) {
    isLoading.value = false
    const errMsg = err.data?.message || err.statusMessage || 'Gagal terhubung ke server database.'
    toast.error(errMsg)
  }
}
</script>
