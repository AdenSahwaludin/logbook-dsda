<template>
  <div class="login-page">
    <ToastContainer />

    <!-- Background Layer -->
    <div class="bg-layer">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <span v-for="n in 15" :key="n" class="particle" :style="particleStyle(n)"></span>
    </div>

    <!-- Login Card -->
    <div class="login-wrapper">
      <div class="login-card" :class="{ 'card-ready': isCardReady }">
        <!-- Accent Top Border Glow -->
        <div class="glow-ring"></div>

        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-container">
            <div class="logo-pulse"></div>
            <img src="/icon.png" alt="Logo DSDA" class="logo-img" />
          </div>
          <h1 class="app-title">Logbook Bulanan</h1>
          <p class="app-subtitle">Sistem Laporan & Presensi Harian</p>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-dot"></span>
          <span class="divider-line"></span>
          <span class="divider-dot"></span>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Username Field -->
          <div class="field-group" :class="{ 'field-focused': focusedField === 'username', 'field-filled': form.username }">
            <label class="field-label">
              <User class="field-label-icon" />
              Username
            </label>
            <div class="input-wrapper">
              <User class="input-icon" />
              <input
                v-model="form.username"
                type="text"
                placeholder="Masukkan username"
                autocomplete="username"
                required
                @focus="focusedField = 'username'"
                @blur="focusedField = ''"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="field-group" :class="{ 'field-focused': focusedField === 'password', 'field-filled': form.password }">
            <label class="field-label">
              <Lock class="field-label-icon" />
              Password
            </label>
            <div class="input-wrapper">
              <Lock class="input-icon" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                autocomplete="current-password"
                required
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="toggle-password"
                tabindex="-1"
              >
                <Eye v-if="!showPassword" />
                <EyeOff v-else />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
          >
            <div class="btn-bg"></div>
            <div class="btn-content">
              <Loader2 v-if="isLoading" class="btn-spinner" />
              <LogIn v-else class="btn-icon" />
              <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Aplikasi' }}</span>
            </div>
          </button>
        </form>

        <!-- Footer -->
        <p class="login-footer">
          <Shield class="footer-icon" />
          Dilindungi dengan enkripsi end-to-end
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import ToastContainer from '~/components/common/ToastContainer.vue'
import { User, Lock, Eye, EyeOff, Loader2, LogIn, Shield } from 'lucide-vue-next'

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
const focusedField = ref('')
const isCardReady = ref(false)

function particleStyle(n: number) {
  const size = 2 + Math.random() * 3
  const x = Math.random() * 100
  const delay = Math.random() * 15
  const duration = 15 + Math.random() * 20
  const opacity = 0.2 + Math.random() * 0.3
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: opacity
  }
}

onMounted(() => {
  setTimeout(() => {
    isCardReady.value = true
  }, 50)
})

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

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 1rem;
  background: #eff6ff;
}

/* Background */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 40%, #e0e7ff 70%, #fae8ff 100%);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  will-change: transform;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.25), transparent 70%);
  top: -10%;
  left: -10%;
  animation: float-orb-1 18s ease-in-out infinite;
}

.orb-2 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.22), transparent 70%);
  bottom: -15%;
  right: -10%;
  animation: float-orb-2 22s ease-in-out infinite;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.25), transparent 70%);
  top: 40%;
  left: 45%;
  animation: float-orb-3 15s ease-in-out infinite;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79, 70, 229, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 70, 229, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

@keyframes float-orb-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, 30px); }
}

@keyframes float-orb-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-30px, -40px); }
}

@keyframes float-orb-3 {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -25px); }
}

.particles {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: #6366f1;
  border-radius: 50%;
  animation: rise linear infinite;
}

@keyframes rise {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.3; }
  80% { opacity: 0.1; }
  100% { transform: translateY(-100vh); opacity: 0; }
}

/* Login Card - Always Clear & Visible */
.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
}

.login-card {
  position: relative;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 24px;
  padding: 2.25rem 1.75rem;
  box-shadow:
    0 10px 25px -5px rgba(30, 41, 59, 0.08),
    0 20px 48px -10px rgba(79, 70, 229, 0.12);
  opacity: 0;
  transform: translateY(15px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.login-card.card-ready {
  opacity: 1;
  transform: translateY(0);
}

.glow-ring {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(90deg, #3b82f6, #6366f1, #ec4899);
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 1.25rem;
}

.logo-container {
  position: relative;
  display: inline-flex;
  margin-bottom: 0.75rem;
}

.logo-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(236, 72, 153, 0.25));
}

.logo-img {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.18);
}

.app-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6366f1;
}

/* Form Fields - High Contrast & Always Clear */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-label-icon {
  width: 13px;
  height: 13px;
  color: #4f46e5;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 0.8125rem 1rem 0.8125rem 2.625rem;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  font-size: 0.9375rem;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.input-wrapper input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.input-wrapper input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #64748b;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password svg {
  width: 16px;
  height: 16px;
}

/* Button */
.submit-btn {
  position: relative;
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  margin-top: 0.375rem;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}

.submit-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed);
  border-radius: 12px;
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9375rem;
}

.btn-icon,
.btn-spinner {
  width: 18px;
  height: 18px;
}

.btn-spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.5rem;
  font-size: 0.725rem;
  font-weight: 600;
  color: #64748b;
}

.footer-icon {
  width: 13px;
  height: 13px;
  color: #16a34a;
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.75rem;
    align-items: center;
  }

  .login-card {
    padding: 1.75rem 1.25rem;
    border-radius: 20px;
  }

  .app-title {
    font-size: 1.3rem;
  }
}
</style>
