<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Export Laporan Bulanan</h2>
        <p class="text-xs sm:text-sm text-slate-500">Cetak rekapitulasi bulanan kegiatan pegawai ke format PDF atau MS Word</p>
      </div>

      <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
        <FileSpreadsheet class="w-6 h-6" />
      </div>
    </div>

    <!-- Export Generator Form Card -->
    <div class="card-base p-6 sm:p-8 space-y-6">
      <div class="space-y-4">
        <!-- Select Pegawai / User (WAJIB) -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">
            Pilih Pegawai / User <span class="text-red-500">*</span>
          </label>
          <select v-model="selectedUserId" class="input-base" required>
            <option value="" disabled>-- Pilih Pegawai (Wajib) --</option>
            <option v-for="u in usersStore.usersList" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.jabatan }})
            </option>
          </select>
          <p v-if="!selectedUserId" class="text-xs text-red-500 font-medium">
            * Silakan pilih pegawai terlebih dahulu untuk mencetak laporan.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Select Bulan Awal -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">
              Bulan Awal <span class="text-red-500">*</span>
            </label>
            <select v-model="startMonth" class="input-base" @change="onStartMonthChange">
              <option v-for="(mName, idx) in BULAN_LIST" :key="idx" :value="idx + 1">
                {{ mName }}
              </option>
            </select>
          </div>

          <!-- Select Bulan Akhir -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">
              Bulan Akhir <span class="text-red-500">*</span>
            </label>
            <select v-model="endMonth" class="input-base" @change="onEndMonthChange">
              <option 
                v-for="(mName, idx) in BULAN_LIST" 
                :key="idx" 
                :value="idx + 1"
                :disabled="(idx + 1) < startMonth"
              >
                {{ mName }}
              </option>
            </select>
          </div>

          <!-- Select Tahun -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">
              Pilih Tahun <span class="text-red-500">*</span>
            </label>
            <select v-model="selectedYear" class="input-base">
              <option v-for="y in TAHUN_LIST" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Preview Summary Card -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">Ringkasan Dokumen Rekap</p>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Pegawai Terpilih:</span>
          <span class="font-bold text-slate-800">{{ selectedUserName }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Jumlah Laporan Terisi:</span>
          <span class="font-bold text-blue-600 text-base">{{ matchingLaporan.length }} Laporan</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Periode Ekspor:</span>
          <span class="font-bold text-slate-800">{{ periodText }}</span>
        </div>
        <p class="text-xs text-slate-500 pt-1">
          * Dokumen akan digabungkan menjadi 1 file PDF/Word berisi rincian tiap bulan lengkap dengan informasi nama, jabatan, dan lokasi.
        </p>
      </div>

      <!-- Export Action Buttons (PDF & Word) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <!-- PDF Export Button -->
        <button 
          @click="generatePDF" 
          :disabled="isGeneratingPDF || !selectedUserId"
          class="btn-primary py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
        >
          <FileText class="w-5 h-5" />
          <span>{{ isGeneratingPDF ? 'Membuat PDF...' : 'Download PDF Format' }}</span>
        </button>

        <!-- MS Word Export Button -->
        <button 
          @click="generateWord" 
          :disabled="isGeneratingWord || !selectedUserId"
          class="btn-primary py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <FileSpreadsheet class="w-5 h-5" />
          <span>{{ isGeneratingWord ? 'Membuat Word (.docx)' : 'Download Word (.docx)' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLaporanStore } from '~/stores/laporan'
import { useUsersStore } from '~/stores/users'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { saveAs } from 'file-saver'
import { FileSpreadsheet, FileText } from 'lucide-vue-next'

const laporanStore = useLaporanStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedUserId = ref('')
const startMonth = ref(new Date().getMonth() + 1)
const endMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const isGeneratingPDF = ref(false)
const isGeneratingWord = ref(false)

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const TAHUN_LIST = [2026, 2025, 2024]

onMounted(async () => {
  await usersStore.initUsers()
  await laporanStore.initLaporan()
  selectedUserId.value = ''
})

function onStartMonthChange() {
  if (endMonth.value < startMonth.value) {
    endMonth.value = startMonth.value
  }
}

function onEndMonthChange() {
  if (endMonth.value < startMonth.value) {
    startMonth.value = endMonth.value
  }
}

const selectedUserName = computed(() => {
  if (!selectedUserId.value) return '-'
  const u = usersStore.usersList.find(user => user.id === selectedUserId.value)
  return u ? `${u.name} (${u.jabatan})` : '-'
})

const matchingLaporan = computed(() => {
  if (!selectedUserId.value) return []
  return laporanStore.getLaporanFilteredRange(
    selectedUserId.value,
    startMonth.value,
    endMonth.value,
    selectedYear.value
  )
})

const periodText = computed(() => {
  const startName = BULAN_LIST[startMonth.value - 1]
  const endName = BULAN_LIST[endMonth.value - 1]
  if (startMonth.value === endMonth.value) {
    return `${startName} ${selectedYear.value}`
  }
  return `${startName} - ${endName} ${selectedYear.value}`
})

const getExportFileName = (ext: string) => {
  let targetName = 'Rekap'
  if (selectedUserId.value) {
    const u = usersStore.usersList.find(user => user.id === selectedUserId.value)
    if (u?.name) targetName = u.name
  }
  const cleanName = targetName.replace(/[^a-zA-Z0-9]/g, '_')
  const startName = BULAN_LIST[startMonth.value - 1]
  const endName = BULAN_LIST[endMonth.value - 1]

  const monthPart = startMonth.value === endMonth.value 
    ? startName 
    : `${startName}_s.d_${endName}`

  return `${cleanName}_Laporan_Bulanan_${monthPart}_${selectedYear.value}.${ext}`
}

async function generatePDF() {
  if (!selectedUserId.value) {
    toast.error('Silakan pilih pegawai terlebih dahulu!')
    return
  }

  isGeneratingPDF.value = true
  toast.info('Sedang menyusun dokumen PDF...')

  try {
    const params = new URLSearchParams({
      userId: selectedUserId.value,
      startMonth: String(startMonth.value),
      endMonth: String(endMonth.value),
      year: String(selectedYear.value)
    })

    const blob = await $fetch<Blob>(`/api/export/pdf/all?${params.toString()}`, {
      responseType: 'blob'
    })

    const fileName = getExportFileName('pdf')
    saveAs(blob, fileName)
    toast.success(`PDF Berhasil di-download (${fileName})`)
  } catch (err: any) {
    console.error('PDF export error:', err)
    toast.error('Gagal mendownload file PDF')
  } finally {
    isGeneratingPDF.value = false
  }
}

async function generateWord() {
  if (!selectedUserId.value) {
    toast.error('Silakan pilih pegawai terlebih dahulu!')
    return
  }

  isGeneratingWord.value = true
  toast.info('Sedang menyusun dokumen Word (.docx)...')

  try {
    const params = new URLSearchParams({
      userId: selectedUserId.value,
      startMonth: String(startMonth.value),
      endMonth: String(endMonth.value),
      year: String(selectedYear.value)
    })

    const blob = await $fetch<Blob>(`/api/export/docx/all?${params.toString()}`, {
      responseType: 'blob'
    })

    const fileName = getExportFileName('docx')
    saveAs(blob, fileName)
    toast.success(`Dokumen Word berhasil di-download (${fileName})`)
  } catch (err: any) {
    console.error('Word export error:', err)
    toast.error('Gagal mendownload dokumen MS Word')
  } finally {
    isGeneratingWord.value = false
  }
}
</script>
