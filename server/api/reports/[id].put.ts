import { defineEventHandler, readBody } from 'h3'
import { updateReportSchema } from '../../validators/reports'
import { ReportService } from '../../services/reportService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) return sendApiError(event, 'Belum login', 401)

    const id = event.context.params?.id
    if (!id) return sendApiError(event, 'ID Laporan tidak valid', 400)

    const body = await readBody(event)
    const validation = updateReportSchema.safeParse(body)
    if (!validation.success) {
      return sendApiError(event, 'Validasi gagal', 400)
    }

    const req = event.node.req
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    const updated = await ReportService.updateReport(id, validation.data, authUser.role, authUser.id, ipAddress, userAgent)
    return sendSuccess(event, 'Laporan berhasil diperbarui', updated)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
