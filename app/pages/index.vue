<template>
  <div class="space-y-6">
    <!-- Skeleton Loading State -->
    <SkeletonLoader v-if="!isReady" type="card" :count="3" />

    <template v-else>
      <!-- Welcome Banner -->
      <div class="card-base p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-lg relative overflow-hidden">
        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            <Calendar class="w-3.5 h-3.5" />
            <span>{{ currentFormattedDate }}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold">Halo, {{ authStore.currentUser?.name }}</h2>
          <p class="text-blue-100 text-sm max-w-xl">
            {{ authStore.isAdmin ? 'Dashboard Rekapitulasi & Pengelolaan Jurnal Dinas Sumber Daya Air' : 'Pencatatan Jurnal Kegiatan Harian Pegawai Lapangan' }}
          </p>
        </div>
        <!-- Decorative Circle -->
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <!-- ==================== USER DASHBOARD VIEW ==================== -->
      <div v-if="!authStore.isAdmin" class="space-y-6">
        <!-- Stat Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Card 1: Total Laporan Bulan Ini -->
          <div class="card-base p-5 flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-500">Laporan Bulan Ini</p>
              <h3 class="text-3xl font-bold text-slate-900">{{ userLaporanBulanIniCount }} <span class="text-sm font-normal text-slate-500">laporan</span></h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck class="w-6 h-6" />
            </div>
          </div>

          <!-- Card 2: Status Laporan Hari Ini -->
          <div class="card-base p-5 flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-500">Status Hari Ini</p>
              <div class="flex items-center gap-2">
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  :class="hasSubmittedToday ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                >
                  <CheckCircle2 v-if="hasSubmittedToday" class="w-3.5 h-3.5" />
                  <Clock v-else class="w-3.5 h-3.5" />
                  {{ hasSubmittedToday ? 'Sudah Mengisi' : 'Belum Mengisi' }}
                </span>
              </div>
            </div>
            <NuxtLink 
              to="/laporan/tambah" 
              class="btn-primary text-xs py-2.5 px-3"
            >
              <Plus class="w-4 h-4" />
              Buat Laporan
            </NuxtLink>
          </div>
        </div>

        <!-- Draft Resume Warning Banner if Draft exists -->
        <div v-if="laporanStore.draft" class="card-base p-4 bg-amber-50 border-amber-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <FileEdit class="w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-bold text-amber-900">Draft Laporan Belum Disimpan</p>
              <p class="text-xs text-amber-700">Tersimpan otomatis {{ formatDraftTime(laporanStore.draft.lastSavedAt) }}</p>
            </div>
          </div>
          <NuxtLink to="/laporan/tambah" class="btn-primary text-xs py-2 px-3 shrink-0 bg-amber-600 hover:bg-amber-700">
            Lanjutkan
          </NuxtLink>
        </div>

        <!-- Recent Activities Header -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Riwayat Laporan Terbaru</h3>
            <NuxtLink to="/laporan" class="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Lihat Semua
              <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-if="userRecentLaporan.length === 0" class="card-base p-8 text-center space-y-3">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileQuestion class="w-8 h-8" />
            </div>
            <p class="text-sm font-semibold text-slate-700">Belum ada laporan bulan ini.</p>
            <NuxtLink to="/laporan/tambah" class="btn-primary inline-flex text-xs">
              Buat Laporan Pertama
            </NuxtLink>
          </div>

          <!-- List Cards -->
          <div v-else class="space-y-3">
            <div 
              v-for="item in userRecentLaporan" 
              :key="item.id"
              class="card-base p-4 sm:p-5 hover:border-blue-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              @click="$router.push(`/laporan/${item.id}`)"
            >
              <div class="space-y-2 flex-1 min-w-0">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {{ formatIndonesianDate(item.tanggal, item.hari) }}
                  </span>
                  <span class="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
                    <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {{ item.lokasiKegiatan }}
                  </span>
                </div>
                <h4 class="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{{ item.uraianKegiatan }}</h4>
                <p class="text-xs text-slate-600 line-clamp-1"><strong class="font-semibold text-slate-700">Output:</strong> {{ item.outputKegiatan }}</p>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {{ item.keterangan || 'Terverifikasi' }}
                </span>
                <img v-if="item.foto" :src="item.foto" class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== ADMIN DASHBOARD VIEW ==================== -->
      <div v-else class="space-y-6">
        <!-- Admin Summary Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Total User -->
          <div class="card-base p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500">Total Pegawai</span>
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ usersStore.usersList.length }}</h3>
            <p class="text-xs text-slate-500">Pegawai terdaftar di sistem</p>
          </div>

          <!-- Total Laporan Hari Ini -->
          <div class="card-base p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500">Laporan Hari Ini</span>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckSquare class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ adminLaporanHariIniCount }}</h3>
            <p class="text-xs text-slate-500">Dikirim pegawai hari ini</p>
          </div>

          <!-- Total Laporan Bulan Ini -->
          <div class="card-base p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500">Laporan Bulan Ini</span>
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ adminLaporanBulanIniCount }}</h3>
            <p class="text-xs text-slate-500">Total rekapitulasi masuk</p>
          </div>
        </div>

        <!-- Shortcuts Panel -->
        <div class="card-base p-6 space-y-4">
          <h3 class="text-base font-bold text-slate-900">Shortcut Pintas Admin</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NuxtLink 
              to="/users" 
              class="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition group flex items-center gap-3"
            >
              <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
                <Users class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 group-hover:text-purple-700">Kelola User</p>
                <p class="text-xs text-slate-500">Tambah/edit pegawai</p>
              </div>
            </NuxtLink>

            <NuxtLink 
              to="/laporan" 
              class="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition group flex items-center gap-3"
            >
              <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                <FileText class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 group-hover:text-blue-700">Kelola Laporan</p>
                <p class="text-xs text-slate-500">Lihat semua logbook</p>
              </div>
            </NuxtLink>

            <NuxtLink 
              to="/export" 
              class="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition group flex items-center gap-3"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                <Download class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Export Rekap</p>
                <p class="text-xs text-slate-500">Cetak PDF & Word</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Latest Reports Overview -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Seluruh Laporan Masuk Terbaru</h3>
            <NuxtLink to="/laporan" class="text-xs font-semibold text-blue-600 hover:underline">
              Buka Semua Laporan
            </NuxtLink>
          </div>

          <div class="space-y-3">
            <div 
              v-for="item in laporanStore.laporanList.slice(0, 5)" 
              :key="item.id"
              class="card-base p-4 sm:p-5 hover:border-blue-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              @click="$router.push(`/laporan/${item.id}`)"
            >
              <div class="space-y-2 flex-1 min-w-0">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {{ item.userName }} ({{ item.userJabatan }})
                  </span>
                  <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {{ formatIndonesianDate(item.tanggal, item.hari) }}
                  </span>
                  <span class="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
                    <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {{ item.lokasiKegiatan }}
                  </span>
                </div>
                <h4 class="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{{ item.uraianKegiatan }}</h4>
                <p class="text-xs text-slate-600 line-clamp-1"><strong class="font-semibold text-slate-700">Output:</strong> {{ item.outputKegiatan }}</p>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  {{ item.keterangan || 'Terverifikasi' }}
                </span>
                <img v-if="item.foto" :src="item.foto" class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useLaporanStore } from '~/stores/laporan'
import { useUsersStore } from '~/stores/users'
import SkeletonLoader from '~/components/common/SkeletonLoader.vue'
import { 
  Calendar, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  FileEdit, 
  ChevronRight, 
  FileQuestion, 
  MapPin, 
  Users, 
  CheckSquare, 
  FileText, 
  Download 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const laporanStore = useLaporanStore()
const usersStore = useUsersStore()

const isReady = ref(false)

onMounted(() => {
  setTimeout(() => {
    isReady.value = true
  }, 200)
})

const currentFormattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('id-ID', options)
})

function formatIndonesianDate(dateStr: string, dayName?: string) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const monthIdx = parseInt(m, 10) - 1
  const monthName = MONTHS[monthIdx] || m
  const formatted = `${d} ${monthName} ${y}`
  return dayName ? `${dayName}, ${formatted}` : formatted
}

const todayStr = computed(() => new Date().toISOString().split('T')[0])
const currentMonth = computed(() => new Date().getMonth() + 1)
const currentYear = computed(() => new Date().getFullYear())

// User Stats
const userLaporanBulanIniCount = computed(() => {
  if (!authStore.currentUser) return 0
  return laporanStore.getLaporanFiltered(authStore.currentUser.id, currentMonth.value, currentYear.value).length
})

const hasSubmittedToday = computed(() => {
  if (!authStore.currentUser) return false
  return laporanStore.laporanList.some(l => l.userId === authStore.currentUser?.id && l.tanggal === todayStr.value)
})

const userRecentLaporan = computed(() => {
  if (!authStore.currentUser) return []
  return laporanStore.getLaporanFiltered(authStore.currentUser.id).slice(0, 5)
})

// Admin Stats
const adminLaporanHariIniCount = computed(() => {
  return laporanStore.laporanList.filter(l => l.tanggal === todayStr.value).length
})

const adminLaporanBulanIniCount = computed(() => {
  return laporanStore.getLaporanFiltered(undefined, currentMonth.value, currentYear.value).length
})

function formatDraftTime(isoStr?: string) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>
