import multer from 'multer'
import path from 'path'

// In-memory storage for streaming directly to Cloudinary
const storage = multer.memoryStorage()

// Allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  const mimeType = file.mimetype.toLowerCase()

  if (ALLOWED_MIME_TYPES.includes(mimeType) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true)
  } else {
    const error = new Error('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.')
    error.status = 400
    cb(error, false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
})

// Middleware wrapper to handle Multer-specific error codes
export const uploadTicketImage = (req, res, next) => {
  const uploadSingle = upload.single('image')

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds maximum allowed limit of 5MB' })
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` })
    } else if (err) {
      return res.status(err.status || 400).json({ message: err.message })
    }
    next()
  })
}
