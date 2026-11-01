import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file buffer to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - The binary buffer of the file
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<object>} Upload result with secure_url
 */
export const uploadToCloudinary = (fileBuffer, folder = 'mern-ticketing-crm/tickets') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are not configured (e.g. local dev without Cloudinary),
    // provide a helpful message
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error('Cloudinary credentials are not configured in environment variables'))
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        resolve(result)
      }
    )

    Readable.from(fileBuffer).pipe(uploadStream)
  })
}

export default cloudinary
