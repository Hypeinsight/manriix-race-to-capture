const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — files live in buffer before being pushed to Cloudinary
const memStorage = multer.memoryStorage();

const screenshotUpload = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are accepted for the Instagram proof'));
  },
});

const videoUpload = multer({
  storage: memStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB — keeps Render free-tier RAM safe
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are accepted'));
  },
});

/**
 * Upload a buffer to Cloudinary via a stream.
 * @param {Buffer} buffer
 * @param {object} options — Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { screenshotUpload, videoUpload, uploadToCloudinary };
