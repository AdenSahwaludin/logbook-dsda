<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button 
        @click="$router.back()" 
        class="p-2 hover:bg-slate-200 rounded-xl transition cursor-pointer"
      >
        <ArrowLeft class="w-5 h-5 text-slate-600" />
      </button>
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Edit Laporan Harian</h2>
        <p class="text-xs sm:text-sm text-slate-500">Perbarui rincian kegiatan atau foto dokumentasi</p>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <SkeletonLoader v-if="!isReady" type="form" :count="4" />

    <template v-else-if="!existingLaporan">
      <div class="card-base p-8 text-center space-y-4">
        <h3 class="text-base font-bold text-slate-800">Laporan Tidak Ditemukan</h3>
        <NuxtLink to="/laporan" class="btn-primary inline-flex text-xs">
          Kembali ke Daftar Laporan
        </NuxtLink>
      </div>
    </template>

    <!-- Form Container -->
    <form v-else @submit.prevent="openConfirm" class="card-base p-5 sm:p-7 space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Tanggal Field -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">
            Tanggal Kegiatan <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.tanggal" 
            type="date" 
            class="input-base" 
            required 
            @change="updateHari"
          />
        </div>

        <!-- Hari Field (Otomatis) -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Hari (Otomatis)</label>
          <input 
            :value="form.hari" 
            type="text" 
            class="input-base input-readonly" 
            readonly 
          />
        </div>
      </div>

      <!-- Lokasi Kegiatan -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700">
          Lokasi Kegiatan <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input 
            v-model="form.lokasiKegiatan" 
            type="text" 
            class="input-base pl-10" 
            required 
          />
          <MapPin class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <!-- Uraian Kegiatan -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700">
          Uraian Kegiatan <span class="text-red-500">*</span>
        </label>
        <textarea 
          v-model="form.uraianKegiatan" 
          rows="4" 
          class="input-base" 
          required
        ></textarea>
      </div>

      <!-- Output Kegiatan -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700">
          Output Kegiatan <span class="text-red-500">*</span>
        </label>
        <textarea 
          v-model="form.outputKegiatan" 
          rows="3" 
          class="input-base" 
          required
        ></textarea>
      </div>

      <!-- Upload Foto -->
      <ImageUploader 
        v-model="form.foto" 
        @error="(msg) => toast.error(msg)"
      />

      <!-- Form Actions -->
      <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <button 
          type="button" 
          @click="$router.back()" 
          class="btn-secondary text-sm"
        >
          Batal
        </button>
        <button 
          type="submit" 
          class="btn-primary text-sm shadow-md shadow-blue-500/20"
        >
          <Save class="w-4 h-4" />
          Simpan Perubahan
        </button>
      </div>
    </form>

    <!-- Confirm Modal -->
    <ConfirmModal 
      :is-open="isConfirmOpen"
      title="Simpan perubahan laporan?"
      message="Apakah Anda yakin ingin memperbarui data laporan ini?"
      confirm-text="Ya, Simpan Perubahan"
      variant="primary"
      @confirm="submitForm"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLaporanStore, calculateHari } from '~/stores/laporan'
import { useToast } from '~/composables/useToast'
import ImageUploader from '~/components/common/ImageUploader.vue'
import SkeletonLoader from '~/components/common/SkeletonLoader.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import { ArrowLeft, MapPin, Save } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const laporanStore = useLaporanStore()
const toast = useToast()

const laporanId = route.params.id as string
const isReady = ref(false)
const isConfirmOpen = ref(false)

const form = ref({
  tanggal: '',
  hari: '',
  lokasiKegiatan: '',
  uraianKegiatan: '',
  outputKegiatan: '',
  foto: ''
})

const existingLaporan = computed(() => laporanStore.getLaporanById(laporanId))

onMounted(() => {
  if (existingLaporan.value) {
    form.value = {
      tanggal: existingLaporan.value.tanggal,
      hari: existingLaporan.value.hari,
      lokasiKegiatan: existingLaporan.value.lokasiKegiatan,
      uraianKegiatan: existingLaporan.value.uraianKegiatan,
      outputKegiatan: existingLaporan.value.outputKegiatan,
      foto: existingLaporan.value.foto
    }
  }
  setTimeout(() => {
    isReady.value = true
  }, 200)
})

function updateHari() {
  form.value.hari = calculateHari(form.value.tanggal)
}

function openConfirm() {
  if (!form.value.tanggal || !form.value.lokasiKegiatan || !form.value.uraianKegiatan || !form.value.outputKegiatan || !form.value.foto) {
    toast.error('Semua field dan foto wajib diisi!')
    return
  }
  isConfirmOpen.value = true
}

function submitForm() {
  isConfirmOpen.value = false
  const updated = laporanStore.updateLaporan(laporanId, {
    tanggal: form.value.tanggal,
    hari: form.value.hari,
    lokasiKegiatan: form.value.lokasiKegiatan,
    uraianKegiatan: form.value.uraianKegiatan,
    outputKegiatan: form.value.outputKegiatan,
    foto: form.value.foto
  })

  if (updated) {
    toast.success('Laporan berhasil diperbarui!')
    router.push(`/laporan/${laporanId}`)
  } else {
    toast.error('Gagal memperbarui laporan')
  }
}
</script>
