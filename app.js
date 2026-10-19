const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const { randomUUID } = require('node:crypto');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();
const imagesPath = path.join(__dirname, 'images');
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use('/images', express.static(imagesPath, { maxAge: '1d', immutable: true }));

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, imagesPath),
  filename: (_req, file, callback) => {
    const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype];
    callback(null, `${randomUUID()}${extension}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP images are accepted.');
      error.statusCode = 415;
      return callback(error);
    }
    callback(null, true);
  }
});

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) return upload.single('image')(req, res, next);
  next();
});
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((error, _req, res, _next) => {
  const status = error.statusCode || (error instanceof multer.MulterError
    ? (error.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
    : (error.name === 'CastError' ? 400 : error.name === 'ValidationError' ? 422 : 500));
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
    ...(error.data ? { data: error.data } : {})
  });
});

module.exports = app;
