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
    // Try primary online API (date.nager.at)
    const res = await $fetch<Array<{ date: string; localName: string; name: string }>>(
      `https://date.nager.at/api/v3/publicholidays/${year}/ID`
    )
    if (Array.isArray(res) && res.length > 0) {
      const map: Record<string, string> = {}
      res.forEach(item => {
        map[item.date] = item.localName || item.name
      })

      holidayCache.set(year, map)
      if (import.meta.client) {
        localStorage.setItem(cacheKey, JSON.stringify(map))
      }
      return map
    }
  } catch (err) {
    // Try secondary fallback API
    try {
      const res = await $fetch<Array<{ tanggal: string; keterangan: string }>>(
        `https://dayoffapi.vercel.app/api?year=${year}`
      )
      if (Array.isArray(res) && res.length > 0) {
        const map: Record<string, string> = {}
        res.forEach(item => {
          map[item.tanggal] = item.keterangan
        })
        holidayCache.set(year, map)
        if (import.meta.client) {
          localStorage.setItem(cacheKey, JSON.stringify(map))
        }
        return map
      }
    } catch {
      // ignore
    }
  }

  // Fallback to internal list
  holidayCache.set(year, FALLBACK_HOLIDAYS)
  return FALLBACK_HOLIDAYS
}
