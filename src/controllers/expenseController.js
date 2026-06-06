"use strict";
const supabase = require('../config/db');
const normalizeExpense = (row) => ({
    id: String(row.id),
    date: row.expense_date ?? row.date ?? '',
    category: row.category,
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? 'USD',
    description: row.description ?? '',
    region: row.region ?? 'Asia Pacific',
});
const getAllExpenses = async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false })
            .order('id', { ascending: false });
        if (error)
            throw error;
        const expenses = (data ?? []).map(normalizeExpense);
        const categoryMap = new Map();
        expenses.forEach((expense) => {
            const name = expense.date
                ? new Date(expense.date).toLocaleString('en-US', { month: 'short', year: 'numeric' })
                : 'Unknown';
            const entry = categoryMap.get(name) ?? {
                name,
                'Surveyor Costs': 0,
                'Travel Expenses': 0,
                'Equipment Costs': 0,
            };
            if (expense.category === 'Surveyor Costs')
                entry['Surveyor Costs'] = Number(entry['Surveyor Costs']) + expense.amount;
            if (expense.category === 'Travel')
                entry['Travel Expenses'] = Number(entry['Travel Expenses']) + expense.amount;
            if (['Equipment', 'Accommodation'].includes(expense.category))
                entry['Equipment Costs'] = Number(entry['Equipment Costs']) + expense.amount;
            categoryMap.set(name, entry);
        });
        res.status(200).json({
            success: true,
            data: {
                expenses,
                categoryStackedData: categoryMap.size > 0 ? Array.from(categoryMap.values()) : [
                    { name: 'Jul 2024', 'Surveyor Costs': 45000, 'Travel Expenses': 25000, 'Equipment Costs': 15000 },
                    { name: 'Jan 2025', 'Surveyor Costs': 58000, 'Travel Expenses': 35000, 'Equipment Costs': 20000 },
                ],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to extract transaction matrices from Supabase',
            error: error.message,
        });
    }
};
const createExpense = async (req, res) => {
    try {
        const { date, category, amount, currency, description, region } = req.body;
        if (!date || !category || !amount) {
            res.status(400).json({
                success: false,
                message: 'Missing mandatory payload inputs (date, category, amount)',
            });
            return;
        }
        const { data, error } = await supabase
            .from('expenses')
            .insert({
            expense_date: date,
            category,
            amount: Number(amount),
            currency: currency || 'USD',
            description: description || '',
            region: region || 'Asia Pacific',
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({
            success: true,
            data: normalizeExpense(data),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Supabase expense insertion failed',
            error: error.message,
        });
    }
};
module.exports = {
    getAllExpenses,
    createExpense,
};
//# sourceMappingURL=expenseController.js.map