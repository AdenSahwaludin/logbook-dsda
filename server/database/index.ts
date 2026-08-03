import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import bcrypt from 'bcryptjs'

const dbUrl = process.env.TURSO_DATABASE_URL || 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN || undefined

const client = createClient({
  url: dbUrl,
  authToken: authToken
})

export const db = drizzle(client, { schema })

let isSeeded = false

export async function initDb() {
  if (isSeeded) return
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        position TEXT,
        section TEXT,
        work_location TEXT,
        district TEXT,
        description TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        day TEXT NOT NULL,
        activity TEXT NOT NULL,
        output TEXT NOT NULL,
        location TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        photo_public_id TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Terverifikasi',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      );
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        application_name TEXT,
        organization_name TEXT,
        logo TEXT,
        updated_at TEXT NOT NULL
      );
    `)

    try {
      const now = new Date().toISOString()
      const adensahPassHash = await bcrypt.hash('adensah', 10)
      const karnadiPassHash = await bcrypt.hash('karnadi', 10)

      // Ensure adensah (Admin) and karnadi (Pegawai) accounts exist
      await db.insert(schema.users).values([
        {
          id: 'usr-adensah-1',
          username: 'adensah',
          password: adensahPassHash,
          name: 'Aden Sahwaludin',
          position: 'Kepala Sub Bagian TU & Operasional',
          section: 'Seksi Pengelolaan Sumber Daya Air',
          workLocation: 'Kantor Dinas SDA Utama',
          district: 'Surabaya',
          role: 'admin',
          status: 'active',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'usr-karnadi-1',
          username: 'karnadi',
          password: karnadiPassHash,
          name: 'Karnadi',
          position: 'Teknisi Lapangan Irigasi',
          section: 'Seksi Pemeliharaan Jaringan Irigasi',
          workLocation: 'UPTD Sumber Daya Air Wilayah II',
          district: 'Sidoarjo',
          role: 'user',
          status: 'active',
          createdAt: now,
          updatedAt: now
        }
      ]).onConflictDoNothing()
    } catch (seedErr) {
      console.warn('Database seed skipped or already existing:', seedErr)
    }

    isSeeded = true
  } catch (err) {
    console.error('Failed initializing DB:', err)
  }
}
