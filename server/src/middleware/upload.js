import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure upload directories exist
const uploadBaseDir = path.resolve(process.cwd(), 'uploads');
const imageUploadDir = path.join(uploadBaseDir, 'images');
const evidenceUploadDir = path.join(uploadBaseDir, 'evidence');

[uploadBaseDir, imageUploadDir, evidenceUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage engine with cryptographic random filename
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img_${Date.now()}_${randomHex}${ext}`);
  },
});

const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, evidenceUploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `doc_${Date.now()}_${randomHex}${ext}`);
  },
});

// Allowed file types
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];

const allowedDocExts = ['.pdf', '.docx', '.txt'];
const allowedDocTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/msword',
  'application/octet-stream', // Some browsers send octet-stream for docx
];

export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImageExts.includes(ext) && (allowedImageTypes.includes(file.mimetype) || file.mimetype.startsWith('image/'))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WebP are allowed.'));
    }
  },
});

export const uploadEvidence = multer({
  storage: evidenceStorage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedDocExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});
