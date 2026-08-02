import { db } from '../database'
import { reports, type ReportInsert, type ReportSelect } from '../database/schema'
import { eq, isNull, and, desc } from 'drizzle-orm'

export class ReportRepository {
  static async findById(id: string): Promise<ReportSelect | undefined> {
    const result = await db.select().from(reports).where(and(eq(reports.id, id), isNull(reports.deletedAt)))
    return result[0]
  }

  static async findByUserIdAndDate(userId: string, dateStr: string): Promise<ReportSelect | undefined> {
    const result = await db.select().from(reports).where(
      and(
        eq(reports.userId, userId),
        eq(reports.date, dateStr),
        isNull(reports.deletedAt)
      )
    )
    return result[0]
  }

  static async findAll(): Promise<ReportSelect[]> {
    return await db.select().from(reports).where(isNull(reports.deletedAt)).orderBy(desc(reports.date))
  }

  static async findByUserId(userId: string): Promise<ReportSelect[]> {
    return await db.select().from(reports).where(
      and(eq(reports.userId, userId), isNull(reports.deletedAt))
    ).orderBy(desc(reports.date))
  }

  static async create(data: ReportInsert): Promise<ReportSelect> {
    await db.insert(reports).values(data)
    const created = await this.findById(data.id!)
    return created!
  }

  static async update(id: string, data: Partial<ReportInsert>): Promise<ReportSelect | undefined> {
    await db.update(reports).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(reports.id, id))
    return await this.findById(id)
  }

  static async softDelete(id: string): Promise<boolean> {
    const now = new Date().toISOString()
    await db.update(reports).set({ deletedAt: now, updatedAt: now }).where(eq(reports.id, id))
    return true
  }

  static async restore(id: string): Promise<boolean> {
    const now = new Date().toISOString()
    await db.update(reports).set({ deletedAt: null, updatedAt: now }).where(eq(reports.id, id))
    return true
  }
}
