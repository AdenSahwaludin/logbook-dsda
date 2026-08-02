import { defineEventHandler, readBody } from 'h3'
import { createUserSchema } from '../../validators/users'
import { UserService } from '../../services/userService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (authUser?.role !== 'admin') {
      return sendApiError(event, 'Akses ditolak: Hanya Admin yang dapat menambah pengguna', 403)
    }

    const body = await readBody(event)
    const validation = createUserSchema.safeParse(body)
    if (!validation.success) {
      return sendApiError(event, 'Validasi gagal: Harap isi kolom yang diperlukan', 400)
    }

    const newUser = await UserService.createUser(validation.data, authUser.id)
    return sendSuccess(event, 'Pengguna berhasil dibuat', newUser, 201)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 400)
  }
})
