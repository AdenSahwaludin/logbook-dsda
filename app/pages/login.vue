<template>
  <div class="login-page" @mousemove="handleMouseMove">
    <ToastContainer />

    <!-- Animated Background -->
    <div class="bg-layer">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <span v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)"></span>
    </div>

    <!-- Login Card -->
    <div class="login-wrapper" :style="cardTransformStyle">
      <div class="login-card" :class="{ 'card-ready': isCardReady }">
        <!-- Glow Ring -->
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
              <div class="input-highlight"></div>
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
              <div class="input-highlight"></div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            :class="{ 'btn-loading': isLoading }"
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

const cardTransformStyle = ref({})

function handleMouseMove(e: MouseEvent) {
  const w = window.innerWidth
  const h = window.innerHeight
  const rotateY = ((e.clientX - w / 2) / w) * 4
  const rotateX = ((e.clientY - h / 2) / h) * -4
  cardTransformStyle.value = {
    transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }
}

function particleStyle(n: number) {
  const size = 2 + Math.random() * 4
  const x = Math.random() * 100
  const delay = Math.random() * 20
  const duration = 15 + Math.random() * 25
  const opacity = 0.15 + Math.random() * 0.35
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
  }, 100)
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
/* ============================
   LOGIN PAGE — MODERN LIGHT GLASSMORPHISM
   ============================ */

.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 1rem;
  background: #f0f4ff;
}

/* ---- Animated Background ---- */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f0fe 0%, #f5f0ff 35%, #e0f7fa 65%, #fef3f2 100%);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 70%);
  top: -15%;
  left: -10%;
  animation: float-orb-1 18s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(244, 114, 182, 0.2), transparent 70%);
  bottom: -20%;
  right: -10%;
  animation: float-orb-2 22s ease-in-out infinite;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.22), transparent 70%);
  top: 40%;
  left: 50%;
  animation: float-orb-3 15s ease-in-out infinite;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%);
}

@keyframes float-orb-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(80px, 60px) scale(1.1); }
  66% { transform: translate(-40px, 30px) scale(0.95); }
}

@keyframes float-orb-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-60px, -50px) scale(1.05); }
  66% { transform: translate(50px, -30px) scale(0.9); }
}

@keyframes float-orb-3 {
  0%, 100% { transform: translate(-50%, 0) scale(1); }
  50% { transform: translate(-50%, -40px) scale(1.15); }
}

/* ---- Particles ---- */
.particles {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: linear-gradient(135deg, #818cf8, #a78bfa);
  border-radius: 50%;
  animation: rise linear infinite;
}

@keyframes rise {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.35;
  }
  90% {
    opacity: 0.08;
  }
  100% {
    transform: translateY(-100vh) translateX(30px);
    opacity: 0;
  }
}

/* ---- Login Card ---- */
.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  transition: transform 0.15s ease-out;
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.5),
    0 4px 24px rgba(99, 102, 241, 0.08),
    0 16px 48px rgba(99, 102, 241, 0.06);
  opacity: 0;
  transform: translateY(30px) scale(0.96);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-card.card-ready {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Glow ring around card */
.glow-ring {
  position: absolute;
  inset: -1px;
  border-radius: 25px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(244, 114, 182, 0.15), rgba(56, 189, 248, 0.2));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.login-card:hover .glow-ring {
  opacity: 1;
}

/* ---- Logo Section ---- */
.logo-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-container {
  position: relative;
  display: inline-flex;
  margin-bottom: 1rem;
}

.logo-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
  animation: pulse-glow 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
}

.logo-img {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  letter-spacing: 0.02em;
}

/* ---- Divider ---- */
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent);
}

.divider-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.4);
}

/* ---- Form ---- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: color 0.25s ease;
}

.field-label-icon {
  width: 12px;
  height: 12px;
  opacity: 0.6;
}

.field-group.field-focused .field-label,
.field-group.field-filled .field-label {
  color: #6366f1;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(203, 213, 225, 0.6);
  border-radius: 14px;
  color: #1e293b;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper input::placeholder {
  color: #b0bec5;
}

.input-wrapper input:focus {
  background: #ffffff;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 16px rgba(99, 102, 241, 0.06);
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #b0bec5;
  pointer-events: none;
  transition: color 0.25s ease;
}

.field-group.field-focused .input-icon {
  color: #6366f1;
}

/* Input Highlight Bar */
.input-highlight {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  border-radius: 0 0 14px 14px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.field-group.field-focused .input-highlight {
  width: calc(100% - 2px);
}

/* Toggle Password */
.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b0bec5;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password svg {
  width: 16px;
  height: 16px;
}

.toggle-password:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}

/* ---- Submit Button ---- */
.submit-btn {
  position: relative;
  width: 100%;
  padding: 0.9375rem 1.5rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  margin-top: 0.5rem;
  transition: transform 0.15s ease, box-shadow 0.25s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.85;
}

.btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1, #818cf8, #a78bfa);
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
  border-radius: 14px;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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
  letter-spacing: 0.01em;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- Footer ---- */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.75rem;
  font-size: 0.7rem;
  color: #94a3b8;
  letter-spacing: 0.03em;
}

.footer-icon {
  width: 12px;
  height: 12px;
  opacity: 0.5;
}

/* ---- Responsive ---- */
@media (max-width: 480px) {
  .login-page {
    padding: 0.75rem;
    align-items: flex-start;
    padding-top: 15vh;
  }

  .login-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .logo-img {
    width: 56px;
    height: 56px;
  }

  .app-title {
    font-size: 1.35rem;
  }

  .gradient-orb {
    filter: blur(60px);
  }

  .orb-1 {
    width: 350px;
    height: 350px;
  }

  .orb-2 {
    width: 300px;
    height: 300px;
  }

  .orb-3 {
    width: 200px;
    height: 200px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .login-card {
    padding: 2.25rem 1.75rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .gradient-orb,
  .particle,
  .logo-pulse,
  .btn-bg {
    animation: none !important;
  }

  .login-card {
    transition: opacity 0.3s ease;
    transform: none;
  }

  .login-card.card-ready {
    transform: none;
  }
}
</style>
