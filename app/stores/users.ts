import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore, type UserProfile } from './auth'

export const useUsersStore = defineStore('users', () => {
  const usersList = ref<UserProfile[]>([])

  async function initUsers() {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      usersList.value = []
      return
    }

    if (import.meta.client) {
      try {
        const res = await $fetch<{ success: boolean; data: any[] }>('/api/users')
        if (res.success && Array.isArray(res.data)) {
          usersList.value = res.data.map(formatUser)
          return
        }
      } catch (err) {
        // Fallback to local
      }

      const saved = localStorage.getItem('dsda_users_list')
      if (saved) {
        try {
          usersList.value = JSON.parse(saved)
        } catch {
          usersList.value = []
        }
      }
    }
  }

  function formatUser(u: any): UserProfile {
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      jabatan: u.position || u.jabatan || 'Staf Lapangan',
      seksi: u.section || u.seksi || 'Seksi Operasional',
      lokasiPenempatan: u.workLocation || u.lokasiPenempatan || 'Kantor Dinas SDA',
      kabupaten: u.district || u.kabupaten || 'Surabaya'
    }
  }

  async function addUser(user: Omit<UserProfile, 'id'>): Promise<{ success: boolean; message: string }> {
    try {
      const res = await $fetch<{ success: boolean; message?: string; data: any }>('/api/users', {
        method: 'POST',
        body: {
          username: user.username,
          name: user.name,
          role: user.role,
          position: user.jabatan,
          section: user.seksi,
          workLocation: user.lokasiPenempatan,
          district: user.kabupaten
        }
      })
      if (res.success && res.data) {
        const created = formatUser(res.data)
        usersList.value.push(created)
        return { success: true, message: res.message || 'Pegawai baru berhasil ditambahkan!' }
      }
      return { success: false, message: res.message || 'Gagal menambahkan pegawai' }
    } catch (err: any) {
      const errMsg = err.data?.message || err.statusMessage || 'Gagal menambahkan data pegawai baru'
      return { success: false, message: errMsg }
    }
  }

  async function updateUser(id: string, updated: Partial<UserProfile>): Promise<{ success: boolean; message: string }> {
    try {
      const res = await $fetch<{ success: boolean; message?: string }>(`/api/users/${id}`, {
        method: 'PUT',
        body: {
          username: updated.username,
          name: updated.name,
          role: updated.role,
          position: updated.jabatan,
          section: updated.seksi,
          workLocation: updated.lokasiPenempatan,
          district: updated.kabupaten
        }
      })

      const idx = usersList.value.findIndex(u => u.id === id)
      if (idx !== -1) {
        usersList.value[idx] = { ...usersList.value[idx], ...updated }
      }
      return { success: true, message: res.message || 'Data pegawai berhasil diperbarui!' }
    } catch (err: any) {
      const errMsg = err.data?.message || err.statusMessage || 'Gagal memperbarui data pegawai'
      return { success: false, message: errMsg }
    }
  }

  async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await $fetch<{ success: boolean; message?: string }>(`/api/users/${id}`, { method: 'DELETE' })
      const idx = usersList.value.findIndex(u => u.id === id)
      if (idx !== -1) {
        usersList.value.splice(idx, 1)
      }
      return { success: true, message: res.message || 'Data pegawai berhasil dihapus!' }
    } catch (err: any) {
      const errMsg = err.data?.message || err.statusMessage || 'Gagal menghapus data pegawai'
      return { success: false, message: errMsg }
    }
  }

  return {
    usersList,
    initUsers,
    addUser,
    updateUser,
    deleteUser
  }
})
