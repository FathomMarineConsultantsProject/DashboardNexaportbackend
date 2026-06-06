"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const supabase = require('../config/db');
const router = express.Router();
router.get('/responses', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('rightship_responses')
            .select('question_id, status, comment');
        if (error)
            throw error;
        const responseMap = {};
        (data ?? []).forEach((row) => {
            responseMap[row.question_id] = {
                status: row.status,
                comment: row.comment || '',
            };
        });
        return res.status(200).json(responseMap);
    }
    catch (error) {
        console.error('Error downloading RightShip responses:', error);
        return res.status(500).json({ error: 'Server error parsing saved vessel inspection statuses.' });
    }
});
router.post('/save', async (req, res) => {
    try {
        const { responses } = req.body;
        if (!responses || typeof responses !== 'object') {
            return res.status(400).json({ error: 'Invalid or empty check responses map provided.' });
        }
        const rows = Object.entries(responses).map(([questionId, data]) => ({
            question_id: questionId,
            status: data.status,
            comment: data.comment,
            updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase
            .from('rightship_responses')
            .upsert(rows, { onConflict: 'question_id' });
        if (error)
            throw error;
        return res.status(200).json({ message: 'Vetting operational checklist synced successfully.' });
    }
    catch (error) {
        console.error('Error batch-saving RightShip checklists:', error);
        return res.status(500).json({ error: 'Server transaction failure compiling vetting metrics.' });
    }
});
module.exports = router;
//# sourceMappingURL=rightship.js.map