<template>
  <div class="card-base p-4 sm:p-6 space-y-4 border border-slate-200/80 shadow-xs">
    <!-- Calendar Header (Month Navigation) -->
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <CalendarIcon class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 leading-tight">
            {{ monthNames[currentMonth - 1] }} {{ currentYear }}
          </h3>
          <p class="text-xs text-slate-500 font-medium">Kalender Presensi & Hari Libur</p>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
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
    <div class="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap pt-1 border-t border-slate-100">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
        <span>Sudah Laporan</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
        <span>Minggu / Libur Nasional</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
        <span>Belum Mengisi</span>
      </div>
    </div>

    <!-- Days Grid Header -->
    <div class="grid grid-cols-7 gap-1 text-center">
      <div
        v-for="(day, idx) in dayNames"
        :key="day"
        class="py-2 text-xs font-bold uppercase tracking-wider"
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
        class="min-h-[64px] sm:min-h-[76px] rounded-xl bg-slate-50/50 opacity-30 border border-transparent"
      ></div>

      <!-- Date Cells -->
      <div
        v-for="cell in daysInMonth"
        :key="cell.dateStr"
        class="min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition relative overflow-hidden"
        :class="[
          cell.isToday ? 'ring-2 ring-blue-500 shadow-xs' : '',
          cell.isSunday || cell.holidayName ? 'bg-red-50/60 border-red-200/70' : 'bg-white border-slate-200/70',
          cell.hasReport ? 'bg-emerald-50/50 border-emerald-300' : ''
        ]"
      >
        <!-- Date Header & Holiday Indicator -->
        <div class="flex items-start justify-between gap-1">
          <span
            class="text-xs sm:text-sm font-extrabold"
            :class="[
              cell.isSunday || cell.holidayName ? 'text-red-600' : 'text-slate-800',
              cell.isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center -ml-0.5 -mt-0.5 text-xs font-bold' : ''
            ]"
          >
            {{ cell.dayNum }}
          </span>

          <!-- Holiday Badge / Dot -->
          <span
            v-if="cell.holidayName"
            class="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-md truncate max-w-[65px] sm:max-w-[90px]"
            :title="cell.holidayName"
          >
            {{ cell.holidayName }}
          </span>
        </div>

        <!-- Report Status Indicator -->
        <div class="mt-1">
          <!-- Has Report -->
          <div
            v-if="cell.hasReport"
            @click="navigateToReport(cell.reportId)"
            class="px-1.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs hover:bg-emerald-700 transition"
            title="Klik untuk lihat detail laporan"
          >
            <CheckCircle2 class="w-3 h-3 shrink-0" />
            <span class="truncate hidden sm:inline">Ada Laporan</span>
            <span class="sm:hidden font-bold">✓</span>
          </div>

          <!-- Past Workday without report -->
          <div
            v-else-if="cell.isPastWorkday"
            class="px-1 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-medium text-center"
          >
            Kosong
          </div>
        </div>
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

function navigateToReport(reportId?: string) {
  if (reportId) {
    router.push(`/laporan/${reportId}`)
  }
}
</script>
