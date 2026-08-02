import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oxnksnop',
  api_key: process.env.CLOUDINARY_API_KEY || '757448977168725',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mgul67LB5ZLJBoB6UcskjCe2VZo',
  secure: true
})

export async function uploadToCloudinary(fileString: string, folder = 'dsda-logbook'): Promise<{ url: string; publicId: string }> {
  try {
    const res = await cloudinary.uploader.upload(fileString, {
      folder: folder,
      resource_type: 'auto'
    })
    return {
      url: res.secure_url,
      publicId: res.public_id
    }
  } catch (err) {
    console.error('Cloudinary upload failed, returning original string:', err)
    return {
      url: fileString,
      publicId: ''
    }
  }
}
