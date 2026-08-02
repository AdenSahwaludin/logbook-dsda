import { defineEventHandler, readBody } from 'h3'
import { changePasswordSchema } from '../../validators/auth'
import { AuthService } from '../../services/authService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) {
      return sendApiError(event, 'Belum login', 401)
    }

    const body = await readBody(event)
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return sendApiError(event, 'Validasi gagal', 400)
    }

    const { oldPassword, newPassword } = validation.data
    const req = event.node.req
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    await AuthService.changePassword(authUser.id, oldPassword, newPassword, ipAddress, userAgent)
    return sendSuccess(event, 'Password berhasil diperbarui')
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
