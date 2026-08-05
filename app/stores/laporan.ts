import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LaporanItem {
  id: string
  userId: string
  userName: string
  userJabatan: string
  tanggal: string
  hari: string
  uraianKegiatan: string
  outputKegiatan: string
  lokasiKegiatan: string
  foto: string
  keterangan: string
  createdAt: string
}

export interface LaporanDraft {
  tanggal: string
  hari: string
  uraianKegiatan: string
  outputKegiatan: string
  lokasiKegiatan: string
  foto: string
  lastSavedAt?: string
}

export const HARI_INDONESIA: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu'
}

export function calculateHari(tanggalStr: string): string {
  if (!tanggalStr) return ''
  const date = new Date(tanggalStr)
  if (isNaN(date.getTime())) return ''
  return HARI_INDONESIA[date.getDay()] || ''
}

export const useLaporanStore = defineStore('laporan', () => {
  const laporanList = ref<LaporanItem[]>([])
  const draft = ref<LaporanDraft | null>(null)
  const isLoaded = ref(false)

  async function initLaporan() {
    if (import.meta.client) {
      try {
        const res = await $fetch<{ success: boolean; data: any[] }>('/api/reports')
        if (res.success && Array.isArray(res.data)) {
          laporanList.value = res.data.map(formatReport)
          isLoaded.value = true
          return
        }
      } catch (err) {
        // Fallback offline
      }

      const saved = localStorage.getItem('dsda_laporan_list')
      if (saved) {
        try {
          laporanList.value = JSON.parse(saved)
        } catch {
          laporanList.value = []
        }
      } else {
        laporanList.value = []
      }

      const savedDraft = localStorage.getItem('dsda_laporan_draft')
      if (savedDraft) {
        try {
          draft.value = JSON.parse(savedDraft)
        } catch {
          draft.value = null
        }
      }
    }
    isLoaded.value = true
  }

  function formatReport(r: any): LaporanItem {
    return {
      id: r.id,
      userId: r.userId,
      userName: r.userName || 'Staf Pegawai',
      userJabatan: r.userJabatan || 'Staf Lapangan',
      tanggal: r.date || r.tanggal,
      hari: r.day || r.hari,
      uraianKegiatan: r.activity || r.uraianKegiatan,
      outputKegiatan: r.output || r.outputKegiatan,
      lokasiKegiatan: r.location || r.lokasiKegiatan,
      foto: r.photoUrl || r.foto,
      keterangan: (r.status !== undefined && r.status !== null) ? r.status : (r.keterangan !== undefined && r.keterangan !== null ? r.keterangan : ''),
      createdAt: r.createdAt || new Date().toISOString()
    }
  }

  function saveDraft(data: LaporanDraft) {
    draft.value = {
      ...data,
      lastSavedAt: new Date().toISOString()
    }
    if (import.meta.client) {
      localStorage.setItem('dsda_laporan_draft', JSON.stringify(draft.value))
    }
  }

  function clearDraft() {
    draft.value = null
    if (import.meta.client) {
      localStorage.removeItem('dsda_laporan_draft')
    }
  }

  async function addLaporan(newItem: Omit<LaporanItem, 'id' | 'createdAt'>): Promise<LaporanItem> {
    try {
      const res = await $fetch<{ success: boolean; data: any }>('/api/reports', {
        method: 'POST',
        body: {
          date: newItem.tanggal,
          activity: newItem.uraianKegiatan,
          output: newItem.outputKegiatan,
          location: newItem.lokasiKegiatan,
          photoUrl: newItem.foto,
          keterangan: newItem.keterangan,
          status: newItem.keterangan
        }
      })
      if (res.success && res.data) {
        const created = formatReport(res.data)
        laporanList.value.unshift(created)
        clearDraft()
        return created
      }
    } catch (err: any) {
      if (err.statusCode === 409 || err.data?.message?.includes('1 laporan per hari')) {
        throw err
      }
    }

    const item: LaporanItem = {
      ...newItem,
      id: `lap-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    laporanList.value.unshift(item)
    if (import.meta.client) {
      localStorage.setItem('dsda_laporan_list', JSON.stringify(laporanList.value))
    }
    clearDraft()
    return item
  }

  async function updateLaporan(id: string, updatedFields: Partial<LaporanItem>): Promise<boolean> {
    try {
      await $fetch(`/api/reports/${id}`, {
        method: 'PUT',
        body: {
          date: updatedFields.tanggal,
          activity: updatedFields.uraianKegiatan,
          output: updatedFields.outputKegiatan,
          location: updatedFields.lokasiKegiatan,
          photoUrl: updatedFields.foto,
          keterangan: updatedFields.keterangan,
          status: updatedFields.keterangan
        }
      })
    } catch (err) {
      // Local fallback
    }

    const idx = laporanList.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      laporanList.value[idx] = { ...laporanList.value[idx], ...updatedFields }
      if (import.meta.client) {
        localStorage.setItem('dsda_laporan_list', JSON.stringify(laporanList.value))
      }
      return true
    }
    return false
  }

  async function deleteLaporan(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/reports/${id}`, { method: 'DELETE' })
    } catch (err) {
      // Local fallback
    }

    const idx = laporanList.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      laporanList.value.splice(idx, 1)
      if (import.meta.client) {
        localStorage.setItem('dsda_laporan_list', JSON.stringify(laporanList.value))
      }
      return true
    }
    return false
  }

  function getLaporanById(id: string): LaporanItem | undefined {
    return laporanList.value.find(l => l.id === id)
  }

  function getLaporanFiltered(userId?: string, month?: number | string, year?: number | string, search?: string) {
    return laporanList.value.filter(item => {
      if (userId && item.userId !== userId) return false

      if (month || year) {
        const itemDate = new Date(item.tanggal)
        if (month && (itemDate.getMonth() + 1) !== Number(month)) return false
        if (year && itemDate.getFullYear() !== Number(year)) return false
      }

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim()
        const matchUraian = item.uraianKegiatan?.toLowerCase().includes(q)
        const matchOutput = item.outputKegiatan?.toLowerCase().includes(q)
        const matchLokasi = item.lokasiKegiatan?.toLowerCase().includes(q)
        const matchUser = item.userName?.toLowerCase().includes(q)
        if (!matchUraian && !matchOutput && !matchLokasi && !matchUser) return false
      }

      return true
    })
  }

  function getLaporanFilteredRange(userId?: string, startMonth?: number | string, endMonth?: number | string, year?: number | string, search?: string) {
    return laporanList.value.filter(item => {
      if (userId && item.userId !== userId) return false

      if (item.tanggal) {
        const itemDate = new Date(item.tanggal)
        const itemMonth = itemDate.getMonth() + 1
        const itemYear = itemDate.getFullYear()

        if (year && itemYear !== Number(year)) return false
        if (startMonth && itemMonth < Number(startMonth)) return false
        if (endMonth && itemMonth > Number(endMonth)) return false
      }

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim()
        const matchUraian = item.uraianKegiatan?.toLowerCase().includes(q)
        const matchOutput = item.outputKegiatan?.toLowerCase().includes(q)
        const matchLokasi = item.lokasiKegiatan?.toLowerCase().includes(q)
        const matchUser = item.userName?.toLowerCase().includes(q)
        if (!matchUraian && !matchOutput && !matchLokasi && !matchUser) return false
      }

      return true
    })
  }

  return {
    laporanList,
    draft,
    isLoaded,
    initLaporan,
    saveDraft,
    clearDraft,
    addLaporan,
    updateLaporan,
    deleteLaporan,
    getLaporanById,
    getLaporanFiltered,
    getLaporanFilteredRange
  }
})
