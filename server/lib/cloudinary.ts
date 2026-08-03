import { v2 as cloudinary } from 'cloudinary'

export async function uploadToCloudinary(fileString: string, folder = 'dsda-reports'): Promise<{ url: string; publicId: string }> {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'oxnksnop'
    const apiKey = process.env.CLOUDINARY_API_KEY || '757448977168725'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mgul67LB5ZLJBoB6UcskjCe2VZo'

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    })

    const res = await cloudinary.uploader.upload(fileString, {
      folder: folder,
      resource_type: 'auto'
    })

    console.log('[Cloudinary] Successfully uploaded image:', res.secure_url)
    return {
      url: res.secure_url,
      publicId: res.public_id
    }
  } catch (err) {
    console.error('[Cloudinary] Upload error:', err)
    return {
      url: fileString,
      publicId: ''
    }
  }
}
