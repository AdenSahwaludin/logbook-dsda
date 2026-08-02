import { db } from '../database'
import { auditLogs, type AuditLogInsert } from '../database/schema'

export class AuditRepository {
  static async log(data: Omit<AuditLogInsert, 'id' | 'createdAt'>) {
    try {
      await db.insert(auditLogs).values({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...data,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Audit logging failed:', err)
    }
  }
}
