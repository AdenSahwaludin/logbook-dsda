import { defineEventHandler } from 'h3'
import { UserService } from '../../services/userService'
import { sendSuccess, sendApiError } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    const authUser = event.context.user
    if (!authUser) {
      return sendApiError(event, 'Belum login', 401)
    }

    const user = await UserService.getUserById(authUser.id)
    return sendSuccess(event, 'Data profil berhasil diambil', user)
  } catch (err: any) {
    return sendApiError(event, err.statusMessage || err.message, err.statusCode || 401)
  }
})
