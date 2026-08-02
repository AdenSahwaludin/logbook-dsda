<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Kelola Data Pegawai / User</h2>
        <p class="text-xs sm:text-sm text-slate-500">Tambah, ubah, atau nonaktifkan akun pengguna aplikasi</p>
      </div>

      <button @click="openAddModal" class="btn-primary shrink-0 text-sm">
        <UserPlus class="w-4 h-4" />
        Tambah Pegawai Baru
      </button>
    </div>

    <!-- Search & Filter Card -->
    <div class="card-base p-4 sm:p-5">
      <div class="relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nama pegawai, username, jabatan, atau seksi..." 
          class="input-base input-has-icon-left" 
        />
        <Search class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>

    <!-- Users Grid Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="u in filteredUsers" 
        :key="u.id" 
        class="card-base p-5 space-y-4 hover:border-purple-300 transition"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-base">
              {{ u.name.charAt(0) }}
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                {{ u.name }}
                <span 
                  class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                  :class="u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ u.role }}
                </span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">@{{ u.username }}</p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button @click="openEditModal(u)" class="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition cursor-pointer">
              <Edit3 class="w-4 h-4" />
            </button>
            <button @click="openDeleteConfirm(u.id)" class="p-2 hover:bg-red-50 text-red-600 rounded-xl transition cursor-pointer">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span class="text-slate-400 block text-[11px] font-semibold">JABATAN</span>
            <span class="font-semibold text-slate-800">{{ u.jabatan }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-semibold">SEKSI</span>
            <span class="font-semibold text-slate-800">{{ u.seksi }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-semibold">LOKASI</span>
            <span class="font-semibold text-slate-800">{{ u.lokasiPenempatan }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-semibold">KABUPATEN</span>
            <span class="font-semibold text-slate-800">{{ u.kabupaten }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit User -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="card-base w-full max-w-lg p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-lg font-bold text-slate-900">
              {{ editingUserId ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru' }}
            </h3>
            <button @click="isModalOpen = false" class="p-1 hover:bg-slate-100 rounded-lg">
              <X class="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-700">Username *</label>
                <input v-model="userForm.username" type="text" class="input-base" required />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-700">Role *</label>
                <select v-model="userForm.role" class="input-base" required>
                  <option value="user">User (Pegawai)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Nama Lengkap & Gelar *</label>
              <input v-model="userForm.name" type="text" class="input-base" placeholder="Contoh: Ahmad Fauzi, A.Md" required />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Jabatan *</label>
              <input v-model="userForm.jabatan" type="text" class="input-base" placeholder="Contoh: Teknisi Lapangan Irigasi" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-700">Seksi *</label>
                <input v-model="userForm.seksi" type="text" class="input-base" placeholder="Seksi Pemeliharaan" required />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-slate-700">Kabupaten *</label>
                <input v-model="userForm.kabupaten" type="text" class="input-base" placeholder="Sidoarjo / Surabaya" required />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Lokasi Penempatan *</label>
              <input v-model="userForm.lokasiPenempatan" type="text" class="input-base" placeholder="Contoh: UPTD Wilayah II" required />
            </div>

            <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button type="button" @click="isModalOpen = false" class="btn-secondary text-sm">Batal</button>
              <button type="submit" class="btn-primary text-sm">Simpan Data Pegawai</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="isConfirmOpen"
      title="Hapus Data Pegawai?"
      message="Akun pegawai ini akan dihapus dari sistem kelola user."
      confirm-text="Ya, Hapus Pegawai"
      variant="danger"
      @confirm="handleDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '~/stores/users'
import type { UserProfile } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import { UserPlus, Search, Edit3, Trash2, X } from 'lucide-vue-next'

const usersStore = useUsersStore()
const toast = useToast()

const searchQuery = ref('')
const isModalOpen = ref(false)
const editingUserId = ref<string | null>(null)
const isConfirmOpen = ref(false)
const targetDeleteId = ref<string | null>(null)

const userForm = ref<Omit<UserProfile, 'id'>>({
  username: '',
  name: '',
  role: 'user',
  jabatan: '',
  lokasiPenempatan: '',
  kabupaten: '',
  seksi: ''
})

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return usersStore.usersList
  const q = searchQuery.value.toLowerCase().trim()
  return usersStore.usersList.filter(u => 
    u.name.toLowerCase().includes(q) ||
    u.username.toLowerCase().includes(q) ||
    u.jabatan.toLowerCase().includes(q) ||
    u.seksi.toLowerCase().includes(q)
  )
})

function openAddModal() {
  editingUserId.value = null
  userForm.value = {
    username: '',
    name: '',
    role: 'user',
    jabatan: '',
    lokasiPenempatan: '',
    kabupaten: '',
    seksi: ''
  }
  isModalOpen.value = true
}

function openEditModal(u: UserProfile) {
  editingUserId.value = u.id
  userForm.value = {
    username: u.username,
    name: u.name,
    role: u.role,
    jabatan: u.jabatan,
    lokasiPenempatan: u.lokasiPenempatan,
    kabupaten: u.kabupaten,
    seksi: u.seksi
  }
  isModalOpen.value = true
}

async function saveUser() {
  if (editingUserId.value) {
    await usersStore.updateUser(editingUserId.value, userForm.value)
    toast.success('Data pegawai berhasil diperbarui!')
  } else {
    await usersStore.addUser(userForm.value)
    toast.success('Pegawai baru berhasil ditambahkan!')
  }
  isModalOpen.value = false
}

function openDeleteConfirm(id: string) {
  targetDeleteId.value = id
  isConfirmOpen.value = true
}

async function handleDelete() {
  if (targetDeleteId.value) {
    await usersStore.deleteUser(targetDeleteId.value)
    toast.success('Data pegawai berhasil dihapus!')
  }
  isConfirmOpen.value = false
  targetDeleteId.value = null
}
</script>
