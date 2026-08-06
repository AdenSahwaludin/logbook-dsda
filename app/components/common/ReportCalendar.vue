<template>
  <div class="card-base p-3.5 sm:p-6 space-y-3 sm:space-y-4 border border-slate-200/80 shadow-xs">
    <!-- Calendar Header (Month Navigation) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <CalendarIcon class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 leading-tight">
            {{ monthNames[currentMonth - 1] }} {{ currentYear }}
          </h3>
          <p class="text-xs text-slate-500 font-medium">Kalender Presensi & Hari Libur</p>
        </div>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <button
          @click="prevMonth"
          class="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
          title="Bulan Sebelumnya"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <button
          @click="resetToCurrent"
          class="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
        >
          Hari Ini
        </button>

        <button
          @click="nextMonth"
          class="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
          title="Bulan Berikutnya"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shrink-0"></span>
        <span class="truncate">Sudah Laporan</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 shrink-0"></span>
        <span class="truncate">Minggu / Libur</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 shrink-0"></span>
        <span class="truncate">Belum Mengisi</span>
      </div>
    </div>

    <!-- Days Grid Header -->
    <div class="grid grid-cols-7 gap-1 text-center">
      <div
        v-for="(day, idx) in dayNames"
        :key="day"
        class="py-1 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
        :class="idx === 0 ? 'text-red-600' : 'text-slate-600'"
      >
        {{ day }}
      </div>
    </div>

    <!-- Month Dates Grid -->
    <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
      <!-- Empty Leading Days -->
      <div
        v-for="empty in firstDayOfWeek"
        :key="'empty-' + empty"
        class="min-h-[50px] sm:min-h-[76px] rounded-xl bg-slate-50/50 opacity-30 border border-transparent"
      ></div>

      <!-- Date Cells -->
      <div
        v-for="cell in daysInMonth"
        :key="cell.dateStr"
        @click="handleCellClick(cell)"
        class="min-h-[50px] sm:min-h-[76px] p-1 sm:p-2 rounded-xl border flex flex-col justify-between transition relative overflow-hidden select-none cursor-pointer"
        :class="[
          cell.isToday ? 'ring-2 ring-blue-500 shadow-xs' : '',
          cell.isSunday || cell.holidayName ? 'bg-red-50/60 border-red-200/70 hover:bg-red-100/60' : 'bg-white border-slate-200/70 hover:bg-slate-50',
          cell.hasReport ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-100/50' : ''
        ]"
      >
        <!-- Date Header & Holiday Indicator -->
        <div class="flex items-start justify-between gap-0.5">
          <span
            class="text-xs sm:text-sm font-extrabold"
            :class="[
              cell.isSunday || cell.holidayName ? 'text-red-600' : 'text-slate-800',
              cell.isToday ? 'bg-blue-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center -ml-0.5 -mt-0.5 text-[10px] sm:text-xs font-bold shadow-xs' : ''
            ]"
          >
            {{ cell.dayNum }}
          </span>

          <!-- Holiday Badge / Indicator -->
          <template v-if="cell.holidayName">
            <!-- Desktop Pill Badge -->
            <span
              class="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-md truncate max-w-[85px]"
              :title="cell.holidayName"
            >
              {{ cell.holidayName }}
            </span>
            <!-- Mobile Red Dot/Badge -->
            <span class="sm:hidden flex items-center justify-center w-2 h-2 rounded-full bg-red-500 shrink-0 mt-0.5 mr-0.5" :title="cell.holidayName"></span>
          </template>
        </div>

        <!-- Mobile Holiday Short Text (If applicable and space allows) -->
        <div v-if="cell.holidayName" class="sm:hidden text-[8px] font-bold text-red-600 truncate leading-tight mt-0.5">
          {{ cell.holidayName }}
        </div>

        <!-- Report Status Indicator -->
        <div class="mt-0.5 sm:mt-1">
          <!-- Has Report -->
          <div
            v-if="cell.hasReport"
            class="px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg bg-emerald-600 text-white text-[9px] sm:text-xs font-bold flex items-center justify-center sm:justify-start gap-1 shadow-xs hover:bg-emerald-700 transition"
            title="Klik untuk lihat detail laporan"
          >
            <CheckCircle2 class="w-3 h-3 shrink-0" />
            <span class="truncate hidden sm:inline">Ada Laporan</span>
          </div>

          <!-- Past Workday without report -->
          <div
            v-else-if="cell.isPastWorkday"
            class="px-0.5 py-0.5 sm:px-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[8px] sm:text-[9px] font-medium text-center truncate"
          >
            Kosong
          </div>
        </div>
      </div>
    </div>

    <!-- Holiday Detail Modal (Mobile & Desktop) -->
    <div
      v-if="selectedHoliday"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="selectedHoliday = null"
    >
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <CalendarIcon class="w-5 h-5" />
          </div>
          <button
            @click="selectedHoliday = null"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div class="space-y-1">
          <span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
            Libur Nasional / Cuti Bersama
          </span>
          <h4 class="text-lg font-bold text-slate-900 leading-snug">
            {{ selectedHoliday.name }}
          </h4>
          <p class="text-xs text-slate-500 font-medium">
            {{ formatFullIndonesianDate(selectedHoliday.dateStr) }}
          </p>
        </div>

        <button
          @click="selectedHoliday = null"
          class="w-full btn-primary py-2.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLaporanStore } from '~/stores/laporan'
import { useAuthStore } from '~/stores/auth'
import { fetchIndonesianHolidays } from '~/utils/holidays'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const laporanStore = useLaporanStore()
const authStore = useAuthStore()

const today = new Date()
const currentMonth = ref(today.getMonth() + 1) // 1 - 12
const currentYear = ref(today.getFullYear())

const holidaysMap = ref<Record<string, string>>({})

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

async function loadHolidays() {
  holidaysMap.value = await fetchIndonesianHolidays(currentYear.value)
}

onMounted(() => {
  loadHolidays()
})

watch(currentYear, () => {
  loadHolidays()
})

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function resetToCurrent() {
  currentMonth.value = today.getMonth() + 1
  currentYear.value = today.getFullYear()
}

// Compute 0-indexed first day of week for current month (0 = Sunday, 1 = Monday, etc.)
const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
})

const daysInMonthCount = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0).getDate()
})

const todayStr = computed(() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const userReportsMap = computed(() => {
  const userId = authStore.currentUser?.id
  const map: Record<string, string> = {} // dateStr -> reportId
  if (!userId) return map

  const reports = laporanStore.getLaporanFiltered(userId)
  reports.forEach(r => {
    map[r.tanggal] = r.id
  })
  return map
})

interface CalendarCell {
  dayNum: number
  dateStr: string
  isSunday: boolean
  isToday: boolean
  holidayName?: string
  hasReport: boolean
  reportId?: string
  isPastWorkday: boolean
}

const daysInMonth = computed<CalendarCell[]>(() => {
  const cells: CalendarCell[] = []
  const count = daysInMonthCount.value

  for (let d = 1; d <= count; d++) {
    const dateObj = new Date(currentYear.value, currentMonth.value - 1, d)
    const monthStr = String(currentMonth.value).padStart(2, '0')
    const dayStr = String(d).padStart(2, '0')
    const dateStr = `${currentYear.value}-${monthStr}-${dayStr}`
    
    const dayOfWeek = dateObj.getDay()
    const isSunday = dayOfWeek === 0
    const holidayName = holidaysMap.value[dateStr]
    const reportId = userReportsMap.value[dateStr]
    const hasReport = !!reportId
    const isToday = dateStr === todayStr.value
    const isPastWorkday = dateStr < todayStr.value && !isSunday && !holidayName && !hasReport

    cells.push({
      dayNum: d,
      dateStr,
      isSunday,
      isToday,
      holidayName,
      hasReport,
      reportId,
      isPastWorkday
    })
  }

  return cells
})

const selectedHoliday = ref<{ name: string; dateStr: string } | null>(null)

function handleCellClick(cell: CalendarCell) {
  if (cell.hasReport && cell.reportId) {
    router.push(`/laporan/${cell.reportId}`)
  } else if (cell.holidayName) {
    selectedHoliday.value = {
      name: cell.holidayName,
      dateStr: cell.dateStr
    }
  }
}

function formatFullIndonesianDate(dateStr: string) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  const dayNamesFull = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dayName = dayNamesFull[dateObj.getDay()]
  const monthName = monthNames[parseInt(m) - 1]
  return `${dayName}, ${d} ${monthName} ${y}`
}

function navigateToReport(reportId?: string) {
  if (reportId) {
    router.push(`/laporan/${reportId}`)
  }
}
</script>
