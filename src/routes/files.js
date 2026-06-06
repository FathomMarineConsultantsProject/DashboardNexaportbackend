"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/db');
const router = express.Router();
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }
        const category = req.body.category || 'hull';
        const status = req.body.status || 'ok';
        const rows = files.map((file) => ({
            filename: file.originalname,
            filepath: `/uploads/${file.filename}`,
            category,
            status,
            size: file.size,
        }));
        const { data, error } = await supabase
            .from('photos')
            .insert(rows)
            .select('id, filename, filepath, category, status, size, uploaded_at');
        if (error)
            throw error;
        const photos = (data ?? []).map((photo) => ({
            ...photo,
            uploadedAt: photo.uploaded_at,
        }));
        return res.status(201).json({
            message: `${files.length} photos uploaded successfully!`,
            photos,
        });
    }
    catch (error) {
        console.error('Upload handler error:', error);
        return res.status(500).json({ error: 'Server error processing file upload.' });
    }
});
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = supabase
            .from('photos')
            .select('id, filename, filepath, category, status, size, uploaded_at')
            .order('uploaded_at', { ascending: false });
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        const photos = (data ?? []).map((photo) => ({
            ...photo,
            uploadedAt: photo.uploaded_at,
        }));
        const stats = photos.reduce((acc, photo) => {
            acc.total += 1;
            const status = photo.status;
            if (status === 'ok' || status === 'minor' || status === 'major' || status === 'critical') {
                acc[status] += 1;
            }
            return acc;
        }, { total: 0, ok: 0, minor: 0, major: 0, critical: 0 });
        return res.json({ stats, photos });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve files.' });
    }
});
module.exports = router;
//# sourceMappingURL=files.js.map