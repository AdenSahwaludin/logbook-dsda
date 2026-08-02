import bcrypt from 'bcryptjs'
import { UserRepository } from '../repositories/userRepository'
import { AuditRepository } from '../repositories/auditRepository'
import type { UserInsert } from '../database/schema'

export class UserService {
  static async getUsers() {
    const users = await UserRepository.findAll()
    return users.map(({ password, ...u }) => u)
  }

  static async getUserById(id: string) {
    const user = await UserRepository.findById(id)
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async createUser(data: any, adminUserId?: string) {
    const existing = await UserRepository.findByUsername(data.username)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'Username sudah terdaftar' })
    }

    const pass = data.password || 'password123'
    const passwordHash = await bcrypt.hash(pass, 10)
    const now = new Date().toISOString()

    const newUser = await UserRepository.create({
      id: `usr-${Date.now()}`,
      username: data.username,
      password: passwordHash,
      name: data.name,
      position: data.position || '',
      section: data.section || '',
      workLocation: data.workLocation || '',
      district: data.district || '',
      description: data.description || '',
      role: data.role || 'user',
      status: 'active',
      createdAt: now,
      updatedAt: now
    })

    await AuditRepository.log({
      userId: adminUserId,
      action: 'CREATE_USER',
      tableName: 'users',
      recordId: newUser.id
    })

    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  static async updateUser(id: string, data: any, adminUserId?: string) {
    const user = await UserRepository.findById(id)
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

    const updateData: Partial<UserInsert> = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const updated = await UserRepository.update(id, updateData)
    await AuditRepository.log({
      userId: adminUserId,
      action: 'UPDATE_USER',
      tableName: 'users',
      recordId: id
    })

    if (!updated) return null
    const { password, ...userWithoutPassword } = updated
    return userWithoutPassword
  }

  static async deleteUser(id: string, adminUserId?: string) {
    const user = await UserRepository.findById(id)
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

    await UserRepository.softDelete(id)
    await AuditRepository.log({
      userId: adminUserId,
      action: 'SOFT_DELETE_USER',
      tableName: 'users',
      recordId: id
    })
    return true
  }

  static async restoreUser(id: string, adminUserId?: string) {
    await UserRepository.restore(id)
    await AuditRepository.log({
      userId: adminUserId,
      action: 'RESTORE_USER',
      tableName: 'users',
      recordId: id
    })
    return true
  }
}
