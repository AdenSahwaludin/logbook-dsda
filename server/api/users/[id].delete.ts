import { defineEventHandler } from 'h3'
import { UserService } from '../../services/userService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat menghapus pengguna', 403)
    }

    const id = event.context.params?.id
    if (!id) return sendApiError(event, 'ID Pengguna tidak valid', 400)

    await UserService.deleteUser(id, authUser.id)
    return sendSuccess(event, 'Pengguna berhasil dihapus')
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
