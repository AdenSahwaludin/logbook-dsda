import { defineEventHandler, getQuery, setHeader } from 'h3'
import { ExportService } from '../../../services/exportService'
import { UserService } from '../../../services/userService'
import { sendApiError } from '../../../utils/response'

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat mendownload export laporan', 403)
    }

    const query = getQuery(event)
    const startMonth = query.startMonth ? Number(query.startMonth) : (query.month ? Number(query.month) : (new Date().getMonth() + 1))
    const endMonth = query.endMonth ? Number(query.endMonth) : startMonth
    const year = query.year ? Number(query.year) : new Date().getFullYear()
    const targetUserId = query.userId ? String(query.userId) : undefined

    let targetName = 'Rekap'
    if (targetUserId) {
      try {
        const u = await UserService.getUserById(targetUserId)
        if (u?.name) targetName = u.name
      } catch (e) {}
    }

    const cleanName = targetName.replace(/[^a-zA-Z0-9]/g, '_')
    const startName = MONTH_NAMES_ID[startMonth - 1] || 'Bulan'
    const endName = MONTH_NAMES_ID[endMonth - 1] || 'Bulan'
    const monthPart = startMonth === endMonth ? startName : `${startName}_s.d_${endName}`
    const fileName = `${cleanName}_Laporan_Bulanan_${monthPart}_${year}.pdf`

    const buffer = await ExportService.generatePdfBuffer(targetUserId, startMonth, endMonth, year)

    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`)

    return buffer
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
