import { defineEventHandler } from 'h3'
import { ReportService } from '../../services/reportService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) return sendApiError(event, 'Belum login', 401)

    const id = event.context.params?.id
    if (!id) return sendApiError(event, 'ID Laporan tidak valid', 400)

    const report = await ReportService.getReportById(id, authUser.role, authUser.id)
    return sendSuccess(event, 'Detail laporan berhasil diambil', report)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 404)
  }
})
