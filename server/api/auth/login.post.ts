import { defineEventHandler, readBody, setCookie } from 'h3'
import { loginSchema } from '../../validators/auth'
import { AuthService } from '../../services/authService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return sendApiError(event, 'Validasi gagal: Username dan Password wajib diisi', 400)
    }

    const { username, password } = validation.data
    const req = event.node.req
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    const result = await AuthService.login(username, password, ipAddress, userAgent)

    setCookie(event, 'auth_token', result.token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return sendSuccess(event, 'Login berhasil', result)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message || 'Login gagal', err.statusCode || 401)
  }
})
