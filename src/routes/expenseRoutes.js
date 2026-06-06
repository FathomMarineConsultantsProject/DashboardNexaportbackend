"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const supabase = require('../config/db');
const router = express.Router();
const normalizeExpense = (row) => ({
    id: String(row.id),
    itemName: row.item_name ?? row.itemName ?? '',
    amount: Number(row.amount ?? 0),
    category: row.category ?? 'General',
    invoiceNumber: row.invoice_number ?? row.invoiceNumber ?? '',
    paymentDueDate: row.payment_due_date ?? row.paymentDueDate ?? '',
    status: row.status ?? 'Pending',
});
router.get('/', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('id', { ascending: false });
        if (error)
            throw error;
        return res.status(200).json({
            success: true,
            expense: (data ?? []).map(normalizeExpense),
        });
    }
    catch (error) {
        console.error('Supabase expense fetch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server failure fetching expense records.',
        });
    }
});
router.post('/add', async (req, res) => {
    try {
        const { itemName, amount, category, invoiceNumber, paymentDueDate } = req.body;
        if (!itemName || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Required parameters (Item Name and Amount) are missing.',
            });
        }
        const { data, error } = await supabase
            .from('expenses')
            .insert({
            item_name: itemName,
            amount: Number(amount),
            category: category || 'General',
            invoice_number: invoiceNumber || null,
            payment_due_date: paymentDueDate || null,
            status: 'Pending',
        })
            .select()
            .single();
        if (error)
            throw error;
        return res.status(201).json({
            success: true,
            message: 'Expense tracking entry synchronized in Supabase.',
            expense: normalizeExpense(data),
        });
    }
    catch (error) {
        console.error('Supabase expense insert error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server failure saving expense record.',
        });
    }
});
module.exports = router;
//# sourceMappingURL=expenseRoutes.js.map