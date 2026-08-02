import { defineEventHandler } from 'h3'
import { ReportService } from '../../../services/reportService'
import { sendSuccess, sendApiError } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat memulihkan laporan', 403)
    }

    const id = event.context.params?.id
    if (!id) return sendApiError(event, 'ID Laporan tidak valid', 400)

    await ReportService.restoreReport(id, authUser.id)
    return sendSuccess(event, 'Laporan berhasil dipulihkan')
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
