"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const supabase = require('../config/db');
const router = express.Router();
const normalizeSchedule = (row) => ({
    id: row.id,
    dateStr: row.date_str ?? row.dateStr,
    type: row.type,
    title: row.title,
    time: row.time_str ?? row.time,
});
router.get('/', async (req, res) => {
    try {
        const { year, month } = req.query;
        let query = supabase
            .from('schedules')
            .select('id, date_str, type, title, time_str')
            .order('date_str', { ascending: true })
            .order('time_str', { ascending: true });
        if (year && month) {
            const monthPattern = `${year}-${String(month).padStart(2, '0')}-%`;
            query = query.like('date_str', monthPattern);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return res.status(200).json((data ?? []).map(normalizeSchedule));
    }
    catch (error) {
        console.error('Error fetching schedules:', error);
        return res.status(500).json({ error: 'Server error retrieving calendar operational slots.' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { dateStr, type, title, time } = req.body;
        if (!dateStr || !type || !title || !time) {
            return res.status(400).json({ error: 'Missing required schedule fields.' });
        }
        const { data, error } = await supabase
            .from('schedules')
            .insert({
            date_str: dateStr,
            type,
            title,
            time_str: time,
        })
            .select('id, date_str, type, title, time_str')
            .single();
        if (error)
            throw error;
        return res.status(201).json({
            message: 'Event scheduled successfully.',
            event: normalizeSchedule(data),
        });
    }
    catch (error) {
        console.error('Error creating schedule:', error);
        return res.status(500).json({ error: 'Server error pinning calendar event.' });
    }
});
module.exports = router;
//# sourceMappingURL=schedules.js.map