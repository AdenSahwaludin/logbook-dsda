import { z } from 'zod'

export const createReportSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  activity: z.string().min(1, 'Uraian kegiatan wajib diisi'),
  output: z.string().min(1, 'Output kegiatan wajib diisi'),
  location: z.string().min(1, 'Lokasi kegiatan wajib diisi'),
  photoUrl: z.string().min(1, 'Foto dokumentasi wajib diunggah'),
  photoPublicId: z.string().optional(),
  description: z.string().optional()
})

export const updateReportSchema = createReportSchema.partial()
