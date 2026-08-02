import { defineEventHandler } from 'h3'
import { ReportService } from '../../services/reportService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) return sendApiError(event, 'Belum login', 401)

    const id = event.context.params?.id
    if (!id) return sendApiError(event, 'ID Laporan tidak valid', 400)

    const req = event.node.req
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    await ReportService.deleteReport(id, authUser.role, authUser.id, ipAddress, userAgent)
    return sendSuccess(event, 'Laporan berhasil dihapus')
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
