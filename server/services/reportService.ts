import { ReportRepository } from '../repositories/reportRepository'
import { UserRepository } from '../repositories/userRepository'
import { AuditRepository } from '../repositories/auditRepository'
import { getIndonesianDayName } from '../utils/date'
import { uploadToCloudinary } from '../lib/cloudinary'

export class ReportService {
  static async getReports(role: string, userId: string, queryUserId?: string, month?: number, year?: number) {
    let reportsList = []
    if (role === 'admin') {
      if (queryUserId) {
        reportsList = await ReportRepository.findByUserId(queryUserId)
      } else {
        reportsList = await ReportRepository.findAll()
      }
    } else {
      reportsList = await ReportRepository.findByUserId(userId)
    }

    const usersList = await UserRepository.findAll()
    const userMap = new Map(usersList.map(u => [u.id, u]))

    let filtered = reportsList.map(r => {
      const u = userMap.get(r.userId)
      return {
        ...r,
        userName: u?.name || 'Staf Pegawai',
        userJabatan: u?.position || 'Staf Lapangan'
      }
    })

    if (month || year) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date)
        if (month && (itemDate.getMonth() + 1) !== Number(month)) return false
        if (year && itemDate.getFullYear() !== Number(year)) return false
        return true
      })
    }

    return filtered
  }

  static async getReportById(id: string, role: string, userId: string) {
    const report = await ReportRepository.findById(id)
    if (!report) {
      throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan' })
    }

    if (role !== 'admin' && report.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Anda tidak memiliki akses ke laporan ini' })
    }

    const u = await UserRepository.findById(report.userId)
    return {
      ...report,
      userName: u?.name || 'Staf Pegawai',
      userJabatan: u?.position || 'Staf Lapangan'
    }
  }

  static async createReport(userId: string, data: any, ipAddress?: string, userAgent?: string) {
    // Check 1 report per day limit per user
    const existingDateReport = await ReportRepository.findByUserIdAndDate(userId, data.date)
    if (existingDateReport) {
      throw createError({
        statusCode: 409,
        statusMessage: `Anda sudah membuat laporan untuk tanggal ${data.date}. Hanya diperbolehkan 1 laporan per hari.`
      })
    }

    const now = new Date().toISOString()
    const dayName = getIndonesianDayName(data.date)

    // Automatically upload base64/image string to Cloudinary if provided
    let finalPhotoUrl = data.photoUrl
    let finalPublicId = data.photoPublicId || ''

    if (data.photoUrl && data.photoUrl.startsWith('data:image/')) {
      const uploaded = await uploadToCloudinary(data.photoUrl, 'dsda-reports')
      finalPhotoUrl = uploaded.url
      finalPublicId = uploaded.publicId
    }

    const newReport = await ReportRepository.create({
      id: `lap-${Date.now()}`,
      userId: userId,
      date: data.date,
      day: dayName,
      activity: data.activity,
      output: data.output,
      location: data.location,
      photoUrl: finalPhotoUrl,
      photoPublicId: finalPublicId,
      description: data.description || '',
      status: 'Terverifikasi',
      createdAt: now,
      updatedAt: now
    })

    await AuditRepository.log({
      userId,
      action: 'CREATE_REPORT',
      tableName: 'reports',
      recordId: newReport.id,
      ipAddress,
      userAgent
    })

    return newReport
  }

  static async updateReport(id: string, data: any, role: string, userId: string, ipAddress?: string, userAgent?: string) {
    const existing = await ReportRepository.findById(id)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan' })
    }

    if (role !== 'admin' && existing.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Anda tidak diizinkan mengubah laporan ini' })
    }

    const dayName = data.date ? getIndonesianDayName(data.date) : existing.day

    let finalPhotoUrl = data.photoUrl || existing.photoUrl
    let finalPublicId = data.photoPublicId || existing.photoPublicId

    if (data.photoUrl && data.photoUrl.startsWith('data:image/')) {
      const uploaded = await uploadToCloudinary(data.photoUrl, 'dsda-reports')
      finalPhotoUrl = uploaded.url
      finalPublicId = uploaded.publicId
    }

    const updated = await ReportRepository.update(id, {
      ...data,
      day: dayName,
      photoUrl: finalPhotoUrl,
      photoPublicId: finalPublicId
    })

    await AuditRepository.log({
      userId,
      action: 'UPDATE_REPORT',
      tableName: 'reports',
      recordId: id,
      ipAddress,
      userAgent
    })

    return updated
  }

  static async deleteReport(id: string, role: string, userId: string, ipAddress?: string, userAgent?: string) {
    const existing = await ReportRepository.findById(id)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan' })
    }

    if (role !== 'admin' && existing.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Anda tidak diizinkan menghapus laporan ini' })
    }

    await ReportRepository.softDelete(id)

    await AuditRepository.log({
      userId,
      action: 'SOFT_DELETE_REPORT',
      tableName: 'reports',
      recordId: id,
      ipAddress,
      userAgent
    })

    return true
  }

  static async restoreReport(id: string, adminUserId: string) {
    await ReportRepository.restore(id)
    await AuditRepository.log({
      userId: adminUserId,
      action: 'RESTORE_REPORT',
      tableName: 'reports',
      recordId: id
    })
    return true
  }
}
