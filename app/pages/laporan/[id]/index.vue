<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Skeleton Loading -->
    <SkeletonLoader v-if="!isReady" type="form" :count="4" />

    <template v-else-if="!laporan">
      <div class="card-base p-8 text-center space-y-4">
        <h3 class="text-base font-bold text-slate-800">Laporan Tidak Ditemukan</h3>
        <p class="text-xs text-slate-500">Data laporan mungkin telah dihapus atau URL tidak valid.</p>
        <NuxtLink to="/laporan" class="btn-primary inline-flex text-xs">
          Kembali ke Daftar Laporan
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between gap-3">
        <button 
          @click="$router.back()" 
          class="p-2 hover:bg-slate-200 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft class="w-5 h-5 text-slate-600" />
        </button>

        <div class="flex items-center gap-2">
          <NuxtLink 
            :to="`/laporan/${laporan.id}/edit`" 
            class="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Edit3 class="w-3.5 h-3.5 text-blue-600" />
            Edit
          </NuxtLink>
          <button 
            @click="isConfirmOpen = true" 
            class="btn-danger text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Hapus
          </button>
        </div>
      </div>

      <!-- Detail Card Content -->
      <div class="card-base p-6 sm:p-8 space-y-6">
        <!-- Header Info -->
        <div class="border-b border-slate-100 pb-5 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
              {{ laporan.hari }}, {{ formatDate(laporan.tanggal) }}
            </span>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {{ laporan.keterangan }}
            </span>
          </div>

          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ laporan.userName }}</h2>
            <p class="text-xs text-slate-500">{{ laporan.userJabatan }}</p>
          </div>
        </div>

        <!-- Detail Fields -->
        <div class="space-y-5">
          <!-- Lokasi -->
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi Kegiatan</p>
            <p class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-blue-600 shrink-0" />
              {{ laporan.lokasiKegiatan }}
            </p>
          </div>

          <!-- Uraian -->
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uraian Kegiatan</p>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {{ laporan.uraianKegiatan }}
            </div>
          </div>

          <!-- Output -->
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Output / Hasil Kegiatan</p>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {{ laporan.outputKegiatan }}
            </div>
          </div>

          <!-- Keterangan -->
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Keterangan</p>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 leading-relaxed">
              {{ laporan.keterangan || '-' }}
            </div>
          </div>

          <!-- Foto Dokumentasi -->
          <div class="space-y-2">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dokumentasi Foto</p>
            <div 
              v-if="laporan.foto && !imageError" 
              class="relative rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer"
              @click="openLightbox = true"
            >
              <img :src="laporan.foto" alt="Dokumentasi Kegiatan" class="w-full max-h-96 object-cover" @error="imageError = true" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-semibold text-xs">
                <Maximize2 class="w-5 h-5" />
                Klik untuk memperbesar foto
              </div>
            </div>
            <p v-else class="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-2xl border border-slate-200">Tidak ada foto dokumentasi / foto gagal dimuat.</p>
          </div>
        </div>
      </div>

      <!-- Lightbox Zoom Modal -->
      <Teleport to="body">
        <div 
          v-if="openLightbox && laporan?.foto && !imageError" 
          class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          @click="openLightbox = false"
        >
          <button class="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-xl cursor-pointer">
            <X class="w-7 h-7" />
          </button>
          <img :src="laporan.foto" class="max-w-full max-h-[90vh] object-contain rounded-lg" @click.stop />
        </div>
      </Teleport>

      <!-- Confirm Delete Modal -->
      <ConfirmModal 
        :is-open="isConfirmOpen"
        :loading="isDeleting"
        title="Hapus Laporan Kegiatan?"
        message="Apakah Anda yakin ingin menghapus data laporan ini?"
        confirm-text="Ya, Hapus"
        loading-text="Menghapus..."
        variant="danger"
        @confirm="handleDelete"
        @cancel="closeDeleteConfirm"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLaporanStore } from '~/stores/laporan'
import { useToast } from '~/composables/useToast'
import SkeletonLoader from '~/components/common/SkeletonLoader.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import { ArrowLeft, Edit3, Trash2, MapPin, Maximize2, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const laporanStore = useLaporanStore()
const toast = useToast()

const isReady = ref(false)
const openLightbox = ref(false)
const isConfirmOpen = ref(false)
const isDeleting = ref(false)
const imageError = ref(false)

const laporanId = route.params.id as string

onMounted(() => {
  setTimeout(() => {
    isReady.value = true
  }, 200)
})

const laporan = computed(() => laporanStore.getLaporanById(laporanId))

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function closeDeleteConfirm() {
  if (!isDeleting.value) {
    isConfirmOpen.value = false
  }
}

async function handleDelete() {
  if (isDeleting.value || !laporan.value) return
  isDeleting.value = true
  try {
    const success = await laporanStore.deleteLaporan(laporan.value.id)
    if (success) {
      toast.success('Laporan berhasil dihapus.')
      isConfirmOpen.value = false
      router.push('/laporan')
    } else {
      toast.error('Gagal menghapus laporan')
    }
  } catch (err) {
    toast.error('Terjadi kesalahan saat menghapus laporan')
  } finally {
    isDeleting.value = false
  }
}
</script>
