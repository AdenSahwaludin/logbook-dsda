import { defineEventHandler, getQuery } from 'h3'
import { ReportService } from '../../services/reportService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) return sendApiError(event, 'Belum login', 401)

    const query = getQuery(event)
    const userId = query.userId as string | undefined
    const month = query.month ? Number(query.month) : undefined
    const year = query.year ? Number(query.year) : undefined

    const reportsList = await ReportService.getReports(authUser.role, authUser.id, userId, month, year)
    return sendSuccess(event, 'Data laporan berhasil diambil', reportsList)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 500)
  }
})
