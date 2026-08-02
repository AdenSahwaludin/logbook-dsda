<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Daftar Laporan Kegiatan</h2>
        <p class="text-xs sm:text-sm text-slate-500">
          {{ authStore.isAdmin ? 'Seluruh rekapitulasi laporan pegawai Dinas Sumber Daya Air' : 'Riwayat jurnal kegiatan harian Anda' }}
        </p>
      </div>

      <NuxtLink to="/laporan/tambah" class="btn-primary shrink-0 text-sm">
        <Plus class="w-4 h-4" />
        Buat Laporan Baru
      </NuxtLink>
    </div>

    <!-- Filters & Search Bar Card (PRD Section 19) -->
    <div class="card-base p-4 sm:p-5 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <!-- Search Input -->
        <div class="sm:col-span-6 relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="authStore.isAdmin ? 'Cari nama pegawai, lokasi, kegiatan...' : 'Cari uraian atau lokasi kegiatan...'" 
            class="input-base pl-10"
          />
          <Search class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Filter Bulan -->
        <div class="sm:col-span-3">
          <select v-model="filterMonth" class="input-base">
            <option value="">Semua Bulan</option>
            <option v-for="(mName, idx) in BULAN_LIST" :key="idx" :value="idx + 1">
              {{ mName }}
            </option>
          </select>
        </div>

        <!-- Filter Tahun -->
        <div class="sm:col-span-3">
          <select v-model="filterYear" class="input-base">
            <option value="">Semua Tahun</option>
            <option v-for="y in TAHUN_LIST" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <SkeletonLoader v-if="!isLoaded" type="list" :count="4" />

    <template v-else>
      <!-- Empty State (PRD Section 15) -->
      <div v-if="paginatedLaporan.length === 0" class="card-base p-12 text-center space-y-4">
        <div class="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FileX class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Belum ada laporan ditemukan.</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau filter bulan/tahun untuk melihat data laporan.
          </p>
        </div>
        <NuxtLink to="/laporan/tambah" class="btn-primary inline-flex text-xs">
          <Plus class="w-4 h-4" />
          Buat Laporan Baru
        </NuxtLink>
      </div>

      <!-- Laporan List Cards -->
      <div v-else class="space-y-3">
        <div 
          v-for="item in paginatedLaporan" 
          :key="item.id"
          class="card-base p-4 sm:p-5 hover:border-blue-300 transition group flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <!-- Left Main Content -->
          <div class="space-y-2 flex-1 cursor-pointer" @click="$router.push(`/laporan/${item.id}`)">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {{ item.hari }}, {{ formatDate(item.tanggal) }}
              </span>
              <span v-if="authStore.isAdmin" class="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                {{ item.userName }}
              </span>
              <span class="text-xs text-slate-500 flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5 text-slate-400" />
                {{ item.lokasiKegiatan }}
              </span>
            </div>

            <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
              {{ item.uraianKegiatan }}
            </h3>

            <p class="text-xs text-slate-600 line-clamp-1">
              <strong class="text-slate-700">Output:</strong> {{ item.outputKegiatan }}
            </p>
          </div>

          <!-- Right Content: Image Thumbnail & Actions -->
          <div class="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <img 
              v-if="item.foto" 
              :src="item.foto" 
              alt="Dokumentasi" 
              class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
              @click="$router.push(`/laporan/${item.id}`)" 
            />

            <!-- Action Buttons -->
            <div class="flex items-center gap-1.5">
              <NuxtLink 
                :to="`/laporan/${item.id}`" 
                class="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                title="Lihat Detail"
              >
                <Eye class="w-4 h-4" />
              </NuxtLink>

              <NuxtLink 
                :to="`/laporan/${item.id}/edit`" 
                class="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition"
                title="Edit Laporan"
              >
                <Edit3 class="w-4 h-4" />
              </NuxtLink>

              <button 
                @click="openDeleteConfirm(item.id)" 
                class="p-2 hover:bg-red-50 text-red-600 rounded-xl transition cursor-pointer"
                title="Hapus Laporan"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Controls (PRD Section 20 - Default 10 data/halaman) -->
        <div v-if="totalPages > 1" class="flex items-center justify-between card-base p-4 mt-6">
          <p class="text-xs text-slate-500">
            Menampilkan <span class="font-bold text-slate-700">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
            - <span class="font-bold text-slate-700">{{ Math.min(currentPage * itemsPerPage, filteredLaporan.length) }}</span>
            dari <span class="font-bold text-slate-700">{{ filteredLaporan.length }}</span> data
          </p>

          <div class="flex items-center gap-1.5">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="text-xs font-bold text-slate-700 px-3">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Confirm Delete Modal (PRD Section 17) -->
    <ConfirmModal 
      :is-open="isConfirmOpen"
      title="Yakin ingin menghapus laporan?"
      message="Data laporan kegiatan harian yang dihapus tidak dapat dikembalikan."
      confirm-text="Hapus Laporan"
      variant="danger"
      @confirm="handleDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useLaporanStore } from '~/stores/laporan'
import { useToast } from '~/composables/useToast'
import SkeletonLoader from '~/components/common/SkeletonLoader.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import { 
  Plus, 
  Search, 
  FileX, 
  MapPin, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const laporanStore = useLaporanStore()
const toast = useToast()

const isLoaded = ref(false)
const searchQuery = ref('')
const filterMonth = ref<string | number>('')
const filterYear = ref<string | number>('')
const currentPage = ref(1)
const itemsPerPage = 10

const isConfirmOpen = ref(false)
const targetDeleteId = ref<string | null>(null)

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const TAHUN_LIST = [2026, 2025, 2024]

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 200)
})

// Filtered list based on role, search, month, year
const filteredLaporan = computed(() => {
  const targetUser = authStore.isAdmin ? undefined : authStore.currentUser?.id
  return laporanStore.getLaporanFiltered(
    targetUser,
    filterMonth.value,
    filterYear.value,
    searchQuery.value
  )
})

const totalPages = computed(() => Math.ceil(filteredLaporan.value.length / itemsPerPage) || 1)

const paginatedLaporan = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredLaporan.value.slice(start, start + itemsPerPage)
})

// Reset page when filter changes
watch([searchQuery, filterMonth, filterYear], () => {
  currentPage.value = 1
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function openDeleteConfirm(id: string) {
  targetDeleteId.value = id
  isConfirmOpen.value = true
}

function handleDelete() {
  if (targetDeleteId.value) {
    const success = laporanStore.deleteLaporan(targetDeleteId.value)
    if (success) {
      toast.success('Berhasil menghapus laporan!')
    } else {
      toast.error('Gagal menghapus laporan')
    }
  }
  isConfirmOpen.value = false
  targetDeleteId.value = null
}
</script>
