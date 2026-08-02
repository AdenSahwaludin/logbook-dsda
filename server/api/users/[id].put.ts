import { defineEventHandler, readBody } from 'h3'
import { updateUserSchema } from '../../validators/users'
import { UserService } from '../../services/userService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat memperbarui pengguna', 403)
    }

    const id = event.context.params?.id
    if (!id) return sendApiError(event, 'ID Pengguna tidak valid', 400)

    const body = await readBody(event)
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return sendApiError(event, 'Validasi gagal', 400)
    }

    const updated = await UserService.updateUser(id, validation.data, authUser.id)
    return sendSuccess(event, 'Pengguna berhasil diperbarui', updated)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
