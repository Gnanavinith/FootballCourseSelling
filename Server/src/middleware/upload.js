import multer from 'multer'
import { AppError } from '../utils/AppError.js'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Upload a JPG, PNG or WebP image.', 400)),
}).single('thumbnail')

const DOC_ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    DOC_ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Upload PDF or Word documents only.', 400)),
}).array('documents', 5)

export const uploadSyllabusFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    DOC_ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Upload a PDF or Word document only.', 400)),
}).single('syllabus')

export const uploadScreenshot = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Upload a JPG, PNG or WebP image.', 400)),
}).single('screenshot')
