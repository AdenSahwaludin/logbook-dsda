import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  position: text('position'),
  section: text('section'),
  workLocation: text('work_location'),
  district: text('district'),
  description: text('description'),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at')
})

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  day: text('day').notNull(),
  activity: text('activity').notNull(),
  output: text('output').notNull(),
  location: text('location').notNull(),
  photoUrl: text('photo_url').notNull(),
  photoPublicId: text('photo_public_id'),
  description: text('description'),
  status: text('status').notNull().default('Terverifikasi'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at')
})

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull()
})

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  applicationName: text('application_name'),
  organizationName: text('organization_name'),
  logo: text('logo'),
  updatedAt: text('updated_at').notNull()
})

export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
export type ReportSelect = typeof reports.$inferSelect
export type ReportInsert = typeof reports.$inferInsert
export type AuditLogSelect = typeof auditLogs.$inferSelect
export type AuditLogInsert = typeof auditLogs.$inferInsert
