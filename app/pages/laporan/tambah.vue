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
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Buat Laporan Harian Baru</h2>
        <p class="text-xs sm:text-sm text-slate-500">Isi uraian dan foto dokumentasi kegiatan lapangan Anda</p>
      </div>
    </div>

    <!-- Auto Save Draft Banner Indicator (PRD Section 12) -->
    <div v-if="draftRestored" class="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-800">
      <div class="flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-blue-600 shrink-0" />
        <span>Draft tersimpan otomatis sebelumnya telah dimuat kembali.</span>
      </div>
      <button @click="discardDraft" class="font-bold underline text-blue-700 hover:text-blue-900 cursor-pointer">
        Hapus Draft
      </button>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="openConfirm" class="card-base p-5 sm:p-7 space-y-5">
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

        <!-- Hari Field (Otomatis & Readonly per PRD) -->
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
            placeholder="Contoh: Saluran Irigasi Bluru Kidul, Sidoarjo" 
            class="input-base input-has-icon-left" 
            required 
          />
          <MapPin class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
          placeholder="Jelaskan secara rinci kegiatan lapangan yang dilaksanakan hari ini..." 
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
          placeholder="Hasil atau capaian fisik dari kegiatan yang telah diselesaikan..." 
          class="input-base" 
          required
        ></textarea>
      </div>

      <!-- Upload Foto Dokumentasi (PRD Section 13) -->
      <ImageUploader 
        v-model="form.foto" 
        @error="(msg) => toast.error(msg)"
      />

      <!-- Keterangan -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700">Keterangan</label>
        <input 
          v-model="form.keterangan" 
          type="text" 
          placeholder="Contoh: Terverifikasi, Selesai, SPV..." 
          class="input-base" 
        />
      </div>

      <!-- Form Actions (Fixed bottom on mobile per PRD UX guidelines) -->
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
          Simpan Laporan
        </button>
      </div>
    </form>

    <!-- Confirmation Modal Before Submit (PRD Section 17) -->
    <ConfirmModal 
      :is-open="isConfirmOpen"
      :loading="isSubmitting"
      title="Apakah laporan sudah benar?"
      message="Pastikan tanggal, lokasi, uraian kegiatan, dan foto dokumentasi sudah sesuai sebelum dikirim."
      confirm-text="Ya, Simpan Laporan"
      loading-text="Menyimpan Laporan..."
      variant="primary"
      @confirm="submitForm"
      @cancel="closeConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useLaporanStore, calculateHari } from '~/stores/laporan'
import { useToast } from '~/composables/useToast'
import ImageUploader from '~/components/common/ImageUploader.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import { ArrowLeft, MapPin, Save, CheckCircle2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const laporanStore = useLaporanStore()
const toast = useToast()
const router = useRouter()

const todayStr = new Date().toISOString().split('T')[0]

const form = ref({
  tanggal: todayStr,
  hari: calculateHari(todayStr),
  lokasiKegiatan: '',
  uraianKegiatan: '',
  outputKegiatan: '',
  foto: '',
  keterangan: ''
})

const isConfirmOpen = ref(false)
const isSubmitting = ref(false)
const draftRestored = ref(false)

onMounted(() => {
  if (laporanStore.draft) {
    form.value.tanggal = laporanStore.draft.tanggal || todayStr
    form.value.hari = calculateHari(form.value.tanggal)
    form.value.lokasiKegiatan = laporanStore.draft.lokasiKegiatan || ''
    form.value.uraianKegiatan = laporanStore.draft.uraianKegiatan || ''
    form.value.outputKegiatan = laporanStore.draft.outputKegiatan || ''
    form.value.foto = laporanStore.draft.foto || ''
    form.value.keterangan = laporanStore.draft.keterangan || ''
    draftRestored.value = true
  }
})

watch(
  form,
  (newVal) => {
    laporanStore.saveDraft({
      tanggal: newVal.tanggal,
      hari: newVal.hari,
      lokasiKegiatan: newVal.lokasiKegiatan,
      uraianKegiatan: newVal.uraianKegiatan,
      outputKegiatan: newVal.outputKegiatan,
      foto: newVal.foto,
      keterangan: newVal.keterangan
    })
  },
  { deep: true }
)

function updateHari() {
  form.value.hari = calculateHari(form.value.tanggal)
}

function discardDraft() {
  laporanStore.clearDraft()
  form.value = {
    tanggal: todayStr,
    hari: calculateHari(todayStr),
    lokasiKegiatan: '',
    uraianKegiatan: '',
    outputKegiatan: '',
    foto: '',
    keterangan: ''
  }
  draftRestored.value = false
  toast.info('Draft berhasil dibersihkan.')
}

function openConfirm() {
  if (!form.value.tanggal) {
    toast.error('Tanggal wajib diisi!')
    return
  }
  if (!form.value.lokasiKegiatan.trim()) {
    toast.error('Lokasi kegiatan wajib diisi!')
    return
  }
  if (!form.value.uraianKegiatan.trim()) {
    toast.error('Uraian kegiatan wajib diisi!')
    return
  }
  if (!form.value.outputKegiatan.trim()) {
    toast.error('Output kegiatan wajib diisi!')
    return
  }
  if (!form.value.foto) {
    toast.error('Foto dokumentasi wajib diunggah!')
    return
  }

  isConfirmOpen.value = true
}

function closeConfirm() {
  if (!isSubmitting.value) {
    isConfirmOpen.value = false
  }
}

async function submitForm() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  const currentUser = authStore.currentUser

  try {
    await laporanStore.addLaporan({
      userId: currentUser?.id || 'usr-pegawai-1',
      userName: currentUser?.name || 'Ahmad Fauzi, A.Md',
      userJabatan: currentUser?.jabatan || 'Teknisi Lapangan Irigasi',
      tanggal: form.value.tanggal,
      hari: form.value.hari,
      lokasiKegiatan: form.value.lokasiKegiatan,
      uraianKegiatan: form.value.uraianKegiatan,
      outputKegiatan: form.value.outputKegiatan,
      foto: form.value.foto,
      keterangan: form.value.keterangan || ''
    })

    toast.success('Laporan berhasil disimpan!')
    isConfirmOpen.value = false
    router.push('/laporan')
  } catch (err: any) {
    const errorMsg = err.data?.message || err.statusMessage || 'Gagal menyimpan laporan'
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}
</script>
