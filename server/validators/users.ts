import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  name: z.string().min(2, 'Nama lengkap wajib diisi'),
  position: z.string().optional(),
  section: z.string().optional(),
  workLocation: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  role: z.enum(['admin', 'user']).default('user')
})

export const updateUserSchema = createUserSchema.partial()
