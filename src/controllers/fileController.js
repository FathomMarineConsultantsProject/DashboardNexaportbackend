"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase = require('../config/db');
const uploadMultipleFiles = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded.' });
        }
        const rows = files.map((file) => ({
            filename: file.filename,
            original_name: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            file_path: file.path,
        }));
        const { data, error } = await supabase
            .from('files')
            .insert(rows)
            .select();
        if (error)
            throw error;
        return res.status(201).json({
            message: 'Files uploaded successfully via Supabase!',
            files: data ?? [],
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const getAllFiles = async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .order('uploaded_at', { ascending: false });
        if (error)
            throw error;
        return res.status(200).json(data ?? []);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
module.exports = {
    uploadMultipleFiles,
    getAllFiles,
};
//# sourceMappingURL=fileController.js.map