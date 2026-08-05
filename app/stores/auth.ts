import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  id: string
  username: string
  name: string
  role: 'admin' | 'user'
  position?: string
  section?: string
  workLocation?: string
  district?: string
  jabatan?: string
  lokasiPenempatan?: string
  kabupaten?: string
  seksi?: string
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  async function initAuth() {
    const token = useCookie('auth_token')

    // 1. Restore from localStorage instantly on client side if saved
    if (import.meta.client && !currentUser.value) {
      const saved = localStorage.getItem('dsda_auth_user')
      if (saved) {
        try {
          currentUser.value = JSON.parse(saved)
        } catch {
          currentUser.value = null
        }
      }
    }

    // 2. If no token cookie exists, reset session
    if (!token.value) {
      currentUser.value = null
      if (import.meta.client) {
        localStorage.removeItem('dsda_auth_user')
      }
      return
    }

    // 3. Validate token against backend API
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : undefined
      const res = await $fetch<{ success: boolean; data: UserProfile }>('/api/auth/me', { headers })
      if (res.success && res.data) {
        currentUser.value = formatUser(res.data)
        if (import.meta.client) {
          localStorage.setItem('dsda_auth_user', JSON.stringify(currentUser.value))
        }
      } else {
        throw new Error('Unauthenticated')
      }
    } catch (err) {
      currentUser.value = null
      token.value = null
      if (import.meta.client) {
        localStorage.removeItem('dsda_auth_user')
      }
    }
  }

  function formatUser(u: any): UserProfile {
    return {
      ...u,
      jabatan: u.position || u.jabatan || 'Staf Lapangan',
      seksi: u.section || u.seksi || 'Seksi Operasional',
      lokasiPenempatan: u.workLocation || u.lokasiPenempatan || 'Kantor Dinas SDA',
      kabupaten: u.district || u.kabupaten || 'Surabaya'
    }
  }

  async function login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await $fetch<{ success: boolean; message: string; data: { token: string; user: any } }>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (res.success && res.data) {
        currentUser.value = formatUser(res.data.user)
        const tokenCookie = useCookie('auth_token', { maxAge: 7 * 24 * 60 * 60, path: '/', sameSite: 'lax' })
        tokenCookie.value = res.data.token

        if (import.meta.client) {
          localStorage.setItem('dsda_auth_user', JSON.stringify(currentUser.value))
        }
        return { success: true, message: res.message || 'Login berhasil' }
      }
      return { success: false, message: res.message || 'Username atau password salah' }
    } catch (err: any) {
      const errorMsg = err.data?.message || err.statusMessage || 'Username atau password tidak valid'
      return { success: false, message: errorMsg }
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      // Ignore
    }
    currentUser.value = null
    const tokenCookie = useCookie('auth_token', { path: '/' })
    tokenCookie.value = null

    if (import.meta.client) {
      localStorage.removeItem('dsda_auth_user')
    }
  }

  async function updatePassword(oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await $fetch<{ success: boolean; message: string }>('/api/profile/password', {
        method: 'PUT',
        body: { oldPassword: oldPass, newPassword: newPass }
      })
      return { success: true, message: res.message }
    } catch (err: any) {
      const errorMsg = err.data?.message || err.statusMessage || 'Gagal memperbarui password'
      return { success: false, message: errorMsg }
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    initAuth,
    login,
    logout,
    updatePassword
  }
})
