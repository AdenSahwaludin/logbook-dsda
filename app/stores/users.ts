import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore, type UserProfile } from './auth'

export const useUsersStore = defineStore('users', () => {
  const usersList = ref<UserProfile[]>([])

  async function initUsers() {
    const authStore = useAuthStore()
    // Only attempt to fetch all users if the logged in account is an Admin
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
        // Silent catch for non-admin or connection issues
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

  async function addUser(user: Omit<UserProfile, 'id'>) {
    try {
      const res = await $fetch<{ success: boolean; data: any }>('/api/users', {
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
        return created
      }
    } catch (err) {
      // Local fallback
    }

    const newUser: UserProfile = {
      ...user,
      id: `usr-${Date.now()}`
    }
    usersList.value.push(newUser)
    if (import.meta.client) {
      localStorage.setItem('dsda_users_list', JSON.stringify(usersList.value))
    }
    return newUser
  }

  async function updateUser(id: string, updated: Partial<UserProfile>) {
    try {
      await $fetch(`/api/users/${id}`, {
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
    } catch (err) {
      // Local fallback
    }

    const idx = usersList.value.findIndex(u => u.id === id)
    if (idx !== -1) {
      usersList.value[idx] = { ...usersList.value[idx], ...updated }
      if (import.meta.client) {
        localStorage.setItem('dsda_users_list', JSON.stringify(usersList.value))
      }
      return true
    }
    return false
  }

  async function deleteUser(id: string) {
    try {
      await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    } catch (err) {
      // Local fallback
    }

    const idx = usersList.value.findIndex(u => u.id === id)
    if (idx !== -1) {
      usersList.value.splice(idx, 1)
      if (import.meta.client) {
        localStorage.setItem('dsda_users_list', JSON.stringify(usersList.value))
      }
      return true
    }
    return false
  }

  return {
    usersList,
    initUsers,
    addUser,
    updateUser,
    deleteUser
  }
})
