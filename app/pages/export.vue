<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Export Laporan Jurnal Harian</h2>
        <p class="text-xs sm:text-sm text-slate-500">Cetak rekapitulasi laporan kegiatan pegawai ke format PDF atau MS Word</p>
      </div>

      <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
        <FileSpreadsheet class="w-6 h-6" />
      </div>
    </div>

    <!-- Export Generator Form Card -->
    <div class="card-base p-6 sm:p-8 space-y-6">
      <div class="space-y-4">
        <!-- Select Pegawai / User -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700">Pilih Pegawai / User *</label>
          <select v-model="selectedUserId" class="input-base">
            <option value="">-- Semua Pegawai --</option>
            <option v-for="u in usersStore.usersList" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.jabatan }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Select Bulan -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Pilih Bulan *</label>
            <select v-model="selectedMonth" class="input-base">
              <option v-for="(mName, idx) in BULAN_LIST" :key="idx" :value="idx + 1">
                {{ mName }}
              </option>
            </select>
          </div>

          <!-- Select Tahun -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-700">Pilih Tahun *</label>
            <select v-model="selectedYear" class="input-base">
              <option v-for="y in TAHUN_LIST" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Preview Summary of Matching Data -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">Ringkasan Dokumen Rekap</p>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Jumlah Laporan Ditemukan:</span>
          <span class="font-bold text-blue-600 text-base">{{ matchingLaporan.length }} Laporan</span>
        </div>
        <p class="text-xs text-slate-500">
          Format ekspor disesuaikan dengan standar Microsoft Word & PDF Dinas Sumber Daya Air.
        </p>
      </div>

      <!-- Export Action Buttons (PDF & Word) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <!-- PDF Export Button -->
        <button 
          @click="generatePDF" 
          :disabled="isGeneratingPDF || matchingLaporan.length === 0"
          class="btn-primary py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
        >
          <FileText class="w-5 h-5" />
          <span>{{ isGeneratingPDF ? 'Membuat PDF...' : 'Download PDF Format' }}</span>
        </button>

        <!-- MS Word Export Button -->
        <button 
          @click="generateWord" 
          :disabled="isGeneratingWord || matchingLaporan.length === 0"
          class="btn-primary py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <FileSpreadsheet class="w-5 h-5" />
          <span>{{ isGeneratingWord ? 'Membuat Word...' : 'Download Word (.docx)' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLaporanStore } from '~/stores/laporan'
import { useUsersStore } from '~/stores/users'
import { useToast } from '~/composables/useToast'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import { FileSpreadsheet, FileText } from 'lucide-vue-next'

const laporanStore = useLaporanStore()
const usersStore = useUsersStore()
const toast = useToast()

const selectedUserId = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const isGeneratingPDF = ref(false)
const isGeneratingWord = ref(false)

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const TAHUN_LIST = [2026, 2025, 2024]

const matchingLaporan = computed(() => {
  return laporanStore.getLaporanFiltered(
    selectedUserId.value || undefined,
    selectedMonth.value,
    selectedYear.value
  )
})

const monthName = computed(() => BULAN_LIST[selectedMonth.value - 1])

// Generate & Download PDF
function generatePDF() {
  if (matchingLaporan.value.length === 0) {
    toast.error('Tidak ada data laporan untuk diexport.')
    return
  }

  isGeneratingPDF.value = true
  toast.info('Sedang menyusun dokumen PDF...')

  setTimeout(() => {
    try {
      const doc = new jsPDF()
      const title = `LAPORAN JURNAL KEGIATAN HARIAN PEGAWAI`
      const subtitle = `DINAS SUMBER DAYA AIR - PERIODE ${monthName.value.toUpperCase()} ${selectedYear.value}`

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(title, 105, 18, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(subtitle, 105, 25, { align: 'center' })
      doc.line(14, 29, 196, 29)

      let yPos = 38

      matchingLaporan.value.forEach((lap, idx) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(`${idx + 1}. Tanggal: ${lap.hari}, ${lap.tanggal} | Pegawai: ${lap.userName}`, 14, yPos)
        yPos += 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Lokasi: ${lap.lokasiKegiatan}`, 18, yPos)
        yPos += 5

        const uraianLines = doc.splitTextToSize(`Uraian: ${lap.uraianKegiatan}`, 175)
        doc.text(uraianLines, 18, yPos)
        yPos += uraianLines.length * 4.5

        const outputLines = doc.splitTextToSize(`Output: ${lap.outputKegiatan}`, 175)
        doc.text(outputLines, 18, yPos)
        yPos += outputLines.length * 4.5 + 4

        doc.setDrawColor(226, 232, 240)
        doc.line(14, yPos, 196, yPos)
        yPos += 8
      })

      const fileName = `Jurnal_DSDA_${monthName.value}_${selectedYear.value}.pdf`
      doc.save(fileName)
      toast.success(`PDF Berhasil di-download (${fileName})`)
    } catch (err) {
      toast.error('Gagal membuat file PDF')
    } finally {
      isGeneratingPDF.value = false
    }
  }, 400)
}

// Generate & Download MS Word (.docx)
async function generateWord() {
  if (matchingLaporan.value.length === 0) {
    toast.error('Tidak ada data laporan untuk diexport.')
    return
  }

  isGeneratingWord.value = true
  toast.info('Sedang menyusun dokumen Word (.docx)...')

  try {
    const rows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })] })], width: { size: 5, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hari/Tanggal', bold: true })] })], width: { size: 18, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama Pegawai', bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Lokasi & Uraian Kegiatan', bold: true })] })], width: { size: 35, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Output Kegiatan', bold: true })] })], width: { size: 22, type: WidthType.PERCENTAGE } }),
        ]
      }),
      ...matchingLaporan.value.map((lap, idx) => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`${idx + 1}`)] }),
            new TableCell({ children: [new Paragraph(`${lap.hari}, ${lap.tanggal}`)] }),
            new TableCell({ children: [new Paragraph(lap.userName)] }),
            new TableCell({ children: [new Paragraph(`Lokasi: ${lap.lokasiKegiatan}\n\nUraian: ${lap.uraianKegiatan}`)] }),
            new TableCell({ children: [new Paragraph(lap.outputKegiatan)] }),
          ]
        })
      )
    ]

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'REKAPITULASI JURNAL KEGIATAN HARIAN PEGAWAI',
                  bold: true,
                  size: 26
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `DINAS SUMBER DAYA AIR - PERIODE ${monthName.value.toUpperCase()} ${selectedYear.value}`,
                  size: 20
                })
              ]
            }),
            new Paragraph({ text: '' }),
            new Table({
              rows: rows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }
      ]
    })

    const blob = await Packer.toBlob(doc)
    const fileName = `Jurnal_DSDA_${monthName.value}_${selectedYear.value}.docx`
    saveAs(blob, fileName)
    toast.success(`Dokumen Word berhasil di-download (${fileName})`)
  } catch (err) {
    toast.error('Gagal membuat dokumen MS Word')
  } finally {
    isGeneratingWord.value = false
  }
}
</script>
