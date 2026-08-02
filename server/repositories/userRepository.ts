import { db } from '../database'
import { users, type UserInsert, type UserSelect } from '../database/schema'
import { eq, isNull, and } from 'drizzle-orm'

export class UserRepository {
  static async findById(id: string): Promise<UserSelect | undefined> {
    const result = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt)))
    return result[0]
  }

  static async findByUsername(username: string): Promise<UserSelect | undefined> {
    const result = await db.select().from(users).where(and(eq(users.username, username), isNull(users.deletedAt)))
    return result[0]
  }

  static async findAll(): Promise<UserSelect[]> {
    return await db.select().from(users).where(isNull(users.deletedAt))
  }

  static async create(data: UserInsert): Promise<UserSelect> {
    await db.insert(users).values(data)
    const created = await this.findById(data.id!)
    return created!
  }

  static async update(id: string, data: Partial<UserInsert>): Promise<UserSelect | undefined> {
    await db.update(users).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(users.id, id))
    return await this.findById(id)
  }

  static async softDelete(id: string): Promise<boolean> {
    const now = new Date().toISOString()
    await db.update(users).set({ deletedAt: now, updatedAt: now }).where(eq(users.id, id))
    return true
  }

  static async restore(id: string): Promise<boolean> {
    const now = new Date().toISOString()
    await db.update(users).set({ deletedAt: null, updatedAt: now }).where(eq(users.id, id))
    return true
  }
}
