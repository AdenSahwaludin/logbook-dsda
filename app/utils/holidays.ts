export interface PublicHoliday {
  date: string // YYYY-MM-DD
  name: string
  isCuti?: boolean
}

// Fallback Indonesian National Holidays for 2025 - 2026 if API is unreachable
const FALLBACK_HOLIDAYS: Record<string, string> = {
  '2025-01-01': 'Tahun Baru 2025 Masehi',
  '2025-01-27': 'Isra Mikraj Nabi Muhammad SAW',
  '2025-01-29': 'Tahun Baru Imlek 2576 Kongzili',
  '2025-03-29': 'Hari Suci Nyepi Tahun Baru Saka 1947',
  '2025-03-31': 'Hari Raya Idul Fitri 1446 Hijriah',
  '2025-04-01': 'Hari Raya Idul Fitri 1446 Hijriah',
  '2025-04-18': 'Wafat Yesus Kristus',
  '2025-04-20': 'Hari Paskah',
  '2025-05-01': 'Hari Buruh Internasional',
  '2025-05-12': 'Hari Raya Waisak 2569 BE',
  '2025-05-29': 'Kenaikan Yesus Kristus',
  '2025-06-01': 'Hari Lahir Pancasila',
  '2025-06-06': 'Hari Raya Idul Adha 1446 Hijriah',
  '2025-06-27': 'Tahun Baru Islam 1447 Hijriah',
  '2025-08-17': 'Hari Kemerdekaan Republik Indonesia',
  '2025-09-05': 'Maulid Nabi Muhammad SAW',
  '2025-12-25': 'Hari Raya Natal',

  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Mikraj Nabi Muhammad SAW',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-19': 'Hari Raya Idul Fitri 1447 Hijriah',
  '2026-03-20': 'Hari Raya Idul Fitri 1447 Hijriah',
  '2026-03-21': 'Hari Suci Nyepi Tahun Baru Saka 1948',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-05-27': 'Hari Raya Idul Adha 1447 Hijriah',
  '2026-06-16': 'Tahun Baru Islam 1448 Hijriah',
  '2026-08-17': 'Hari Kemerdekaan Republik Indonesia',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal'
}

const holidayCache: Map<number, Record<string, string>> = new Map()

export async function fetchIndonesianHolidays(year: number): Promise<Record<string, string>> {
  if (holidayCache.has(year)) {
    return holidayCache.get(year)!
  }

  const cacheKey = `dsda_holidays_${year}`
  if (import.meta.client) {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        holidayCache.set(year, parsed)
        return parsed
      } catch {
        // ignore parsing error
      }
    }
  }

  try {
    // Primary API: Official SKB 3 Menteri Indonesian Holiday API (Tanggal Merah & Cuti Bersama)
    const res = await $fetch<{ success: boolean; data: Array<{ date: string; name: string; type: string }> }>(
      `https://tanggalmerah.upset.dev/api/holidays?year=${year}`
    )
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      const map: Record<string, string> = {}
      res.data.forEach(item => {
        const isLeave = item.type === 'leave'
        const title = isLeave && !item.name.toLowerCase().includes('cuti') ? `Cuti Bersama ${item.name}` : item.name
        map[item.date] = title
      })

      holidayCache.set(year, map)
      if (import.meta.client) {
        localStorage.setItem(cacheKey, JSON.stringify(map))
      }
      return map
    }
  } catch {
    // Secondary Fallback API: APIHariLibur_V2 GitHub Repository
    try {
      const rawData = await $fetch<Record<string, { holiday: boolean; summary: string[]; description: string[] }>>(
        'https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.min.json'
      )
      if (rawData && typeof rawData === 'object') {
        const map: Record<string, string> = {}
        Object.entries(rawData).forEach(([dateStr, details]) => {
          if (dateStr.startsWith(String(year)) && details && (details.holiday || (details.summary && details.summary.length))) {
            map[dateStr] = Array.isArray(details.summary) ? details.summary.join(', ') : String(details.summary)
          }
        })
        if (Object.keys(map).length > 0) {
          holidayCache.set(year, map)
          if (import.meta.client) {
            localStorage.setItem(cacheKey, JSON.stringify(map))
          }
          return map
        }
      }
    } catch {
      // ignore parsing error
    }
  }

  // Fallback to internal list
  holidayCache.set(year, FALLBACK_HOLIDAYS)
  return FALLBACK_HOLIDAYS
}
