import path from 'node:path';
import express from 'express';
import multer from 'multer';
import {
  IMAGENES_RECETAS_DIR,
  IMAGENES_RECETAS_URL_PREFIX,
  asegurarDirectorioImagenes,
  extensionPermitida,
  slugificarNombre,
} from '../config/imagenes.js';

asegurarDirectorioImagenes();

const MAX_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    asegurarDirectorioImagenes();
    cb(null, IMAGENES_RECETAS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpeg';
    const base = slugificarNombre(req.body?.titulo || path.basename(file.originalname, ext));
    const nombre = `${base || 'receta'}_${Date.now()}${ext}`;
    cb(null, nombre);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!extensionPermitida(ext)) {
      cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP o GIF.'));
      return;
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post('/receta', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No se recibió ningún archivo.' });
    return;
  }

  const url = `${IMAGENES_RECETAS_URL_PREFIX}/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.filename });
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'La imagen no puede superar 5 MB.' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  if (err) {
    res.status(400).json({ error: err.message || 'Error al subir la imagen.' });
    return;
  }
  next();
});

export default router;
