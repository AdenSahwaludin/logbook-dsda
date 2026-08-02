import bcrypt from 'bcryptjs'
import { UserRepository } from '../repositories/userRepository'
import { AuditRepository } from '../repositories/auditRepository'
import { signToken, type JwtPayload } from '../lib/jwt'

export class AuthService {
  static async login(username: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await UserRepository.findByUsername(username)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
    }

    if (user.status !== 'active') {
      throw createError({ statusCode: 403, statusMessage: 'Akun Anda tidak aktif' })
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    }

    const token = signToken(payload)

    await AuditRepository.log({
      userId: user.id,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
      ipAddress,
      userAgent
    })

    const { password: _, ...userWithoutPassword } = user
    return { token, user: userWithoutPassword }
  }

  static async changePassword(userId: string, oldPass: string, newPass: string, ipAddress?: string, userAgent?: string) {
    const user = await UserRepository.findById(userId)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' })
    }

    const isMatch = await bcrypt.compare(oldPass, user.password)
    if (!isMatch) {
      throw createError({ statusCode: 400, statusMessage: 'Password lama tidak sesuai' })
    }

    const newHash = await bcrypt.hash(newPass, 10)
    await UserRepository.update(userId, { password: newHash })

    await AuditRepository.log({
      userId,
      action: 'CHANGE_PASSWORD',
      tableName: 'users',
      recordId: userId,
      ipAddress,
      userAgent
    })

    return true
  }
}
