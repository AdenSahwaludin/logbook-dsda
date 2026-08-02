import { defineEventHandler, deleteCookie } from 'h3'
import { sendSuccess } from '../../utils/response'

export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  return sendSuccess(event, 'Logout berhasil')
})
