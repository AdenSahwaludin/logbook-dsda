import { defineEventHandler, readBody } from 'h3'
import { createReportSchema } from '../../validators/reports'
import { ReportService } from '../../services/reportService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) return sendApiError(event, 'Belum login', 401)

    const body = await readBody(event)
    const validation = createReportSchema.safeParse(body)
    if (!validation.success) {
      return sendApiError(event, 'Validasi gagal: Harap isi semua kolom wajib', 400)
    }

    const req = event.node.req
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    const newReport = await ReportService.createReport(authUser.id, validation.data, ipAddress, userAgent)
    return sendSuccess(event, 'Laporan harian berhasil disimpan', newReport, 201)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
