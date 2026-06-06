const express = require('express');
const supabase = require('../config/db');

import type { Request, Response, Router } from 'express';

const router: Router = express.Router();

interface RightshipResponse {
  status: string | null;
  comment: string;
}

router.get('/responses', async (_req: Request, res: Response): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('rightship_responses')
      .select('question_id, status, comment');

    if (error) throw error;

    const responseMap: Record<string, RightshipResponse> = {};
    (data ?? []).forEach((row: any) => {
      responseMap[row.question_id] = {
        status: row.status,
        comment: row.comment || '',
      };
    });

    return res.status(200).json(responseMap);
  } catch (error) {
    console.error('Error downloading RightShip responses:', error);
    return res.status(500).json({ error: 'Server error parsing saved vessel inspection statuses.' });
  }
});

router.post('/save', async (req: Request, res: Response): Promise<any> => {
  try {
    const { responses } = req.body as { responses?: Record<string, RightshipResponse> };

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

    if (error) throw error;

    return res.status(200).json({ message: 'Vetting operational checklist synced successfully.' });
  } catch (error) {
    console.error('Error batch-saving RightShip checklists:', error);
    return res.status(500).json({ error: 'Server transaction failure compiling vetting metrics.' });
  }
});

module.exports = router;
