const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = path.join(__dirname, '..', '..', 'uploads', 'profiles');
fs.mkdirSync(uploadRoot, { recursive: true });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error('Profile photo must be a JPG, JPEG, PNG, or WEBP image'));
    return;
  }
  cb(null, true);
};

const uploadProfilePhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const getUploadedProfilePath = (req) => (req.file ? `/uploads/profiles/${req.file.filename}` : undefined);

module.exports = {
  uploadProfilePhoto,
  getUploadedProfilePath
};
