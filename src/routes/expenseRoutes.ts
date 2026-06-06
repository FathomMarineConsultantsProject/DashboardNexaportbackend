const express = require('express');
const supabase = require('../config/db');

import type { Request, Response, Router } from 'express';

const router: Router = express.Router();

const normalizeExpense = (row: any) => ({
  id: String(row.id),
  itemName: row.item_name ?? '',
  amount: Number(row.amount ?? 0),
  category: row.category ?? 'General',
  invoiceNumber: row.invoice_number ?? '',
  paymentDueDate: row.payment_due_date ?? '',
  status: row.status ?? 'Pending',
});

router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase expense fetch error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      expense: (data ?? []).map(normalizeExpense),
    });
  } catch (error: any) {
    console.error('Expense fetch crash:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server failure fetching expense records.',
    });
  }
});

router.post('/add', async (req: Request, res: Response): Promise<any> => {
  try {
    const { itemName, amount, category, invoiceNumber, paymentDueDate } = req.body;

    console.log('Incoming expense body:', req.body);

    if (!itemName || amount === undefined || amount === null || Number.isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: 'Required parameters itemName and valid amount are missing.',
        body: req.body,
      });
    }

    const insertPayload = {
      item_name: itemName,
      amount: Number(amount),
      category: category || 'General',
      invoice_number: invoiceNumber || null,
      payment_due_date: paymentDueDate || null,
      // status: 'Pending',
    };

    console.log('Expense insert payload:', insertPayload);

    const { data, error } = await supabase
      .from('expenses')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase expense insert error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Expense tracking entry synchronized in Supabase.',
      expense: normalizeExpense(data),
    });
  } catch (error: any) {
  console.error('Expense insert crash FULL:', error);

  return res.status(500).json({
    success: false,
    message: error?.message || 'Internal server failure saving expense record.',
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    fullError: JSON.stringify(error),
  });
}
});

module.exports = router;