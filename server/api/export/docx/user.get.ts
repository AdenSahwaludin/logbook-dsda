import { defineEventHandler, getQuery, setHeader } from 'h3'
import { ExportService } from '../../../services/exportService'
import { sendApiError } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) return sendApiError(event, 'Belum login', 401)

    const query = getQuery(event)
    const startMonth = query.startMonth ? Number(query.startMonth) : (query.month ? Number(query.month) : undefined)
    const endMonth = query.endMonth ? Number(query.endMonth) : startMonth
    const year = query.year ? Number(query.year) : undefined

    const buffer = await ExportService.generateDocxBuffer(authUser.id, startMonth, endMonth, year)

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    setHeader(event, 'Content-Disposition', `attachment; filename="Jurnal_DSDA_${authUser.username}.docx"`)

    return buffer
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
