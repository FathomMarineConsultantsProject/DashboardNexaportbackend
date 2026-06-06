import express = require('express');
import type { Request, Response, Router } from 'express';

const supabase = require('../config/db');
const router: Router = express.Router();

router.post('/update-profile', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, name, role, location, avatar } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing valid User ID.',
      });
    }

    const updates: Record<string, string> = {
      name,
      role,
      location,
    };

    if (avatar) {
      updates.avatar = avatar;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, name, role, location, avatar')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found in Supabase.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Terminal profile configuration updated successfully!',
      user: {
        id: data.id,
        email: data.email,
        name: data.name || '',
        role: data.role || '',
        location: data.location || '',
        avatar: data.avatar || null,
      },
    });
  } catch (error) {
    console.error('Error handling profile update:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing profile update.',
    });
  }
});

module.exports = router;
