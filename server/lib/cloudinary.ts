import { v2 as cloudinary } from 'cloudinary'

export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null
  try {
    // Matches path after /upload/(v[0-9]+/)?(folder/filename) excluding extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/)
    if (match && match[1]) {
      return match[1]
    }
  } catch (err) {
    console.error('[Cloudinary] Failed to extract public_id:', err)
  }
  return null
}

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

    console.log('[Cloudinary] Successfully uploaded image:', res.secure_url, 'public_id:', res.public_id)
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

export async function deleteFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  if (!urlOrPublicId) return false
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

    const publicId = urlOrPublicId.includes('http') ? (extractPublicIdFromUrl(urlOrPublicId) || urlOrPublicId) : urlOrPublicId
    if (!publicId) return false

    const res = await cloudinary.uploader.destroy(publicId)
    console.log('[Cloudinary] Successfully deleted image from Cloudinary:', publicId, res)
    return res.result === 'ok' || res.result === 'not found'
  } catch (err) {
    console.error('[Cloudinary] Delete error:', err)
    return false
  }
}
