import { defineEventHandler, getCookie, getHeader } from 'h3'
import { verifyToken } from '../lib/jwt'
import { initDb } from '../database'

export default defineEventHandler(async (event) => {
  // Ensure DB tables are initialized
  await initDb()

  const path = event.path

  // Only run middleware on /api/ routes
  if (!path.startsWith('/api/')) return

  // Public endpoints
  if (path === '/api/auth/login') return

  let token = getCookie(event, 'auth_token')
  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi login telah berakhir, silakan login kembali' })
  }

  event.context.user = payload
})
