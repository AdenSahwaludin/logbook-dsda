import { ExportService } from '../../../services/exportService'
import { sendApiError } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat mendownload export laporan', 403)
    }

    const query = getQuery(event)
    const month = query.month ? Number(query.month) : undefined
    const year = query.year ? Number(query.year) : undefined

    const buffer = await ExportService.generateDocxBuffer(undefined, month, year)

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    setHeader(event, 'Content-Disposition', 'attachment; filename="Jurnal_DSDA_Semua.docx"')

    return buffer
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
