import { defineEventHandler } from 'h3'
import { UserService } from '../../services/userService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat melihat daftar pengguna', 403)
    }

    const users = await UserService.getUsers()
    return sendSuccess(event, 'Daftar pengguna berhasil diambil', users)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 500)
  }
})
