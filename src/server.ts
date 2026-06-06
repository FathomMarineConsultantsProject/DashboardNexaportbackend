const express = require('express');
const cors = require('cors');
const path = require('path');

import type { Express } from 'express';

const fileRoutes = require('./routes/files');
const scheduleRoutes = require('./routes/schedules');
const rightshipRoutes = require('./routes/rightship');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/files', fileRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/rightship', rightshipRoutes);
app.use('/user', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/inspections', inspectionRoutes);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TypeScript Server running smoothly on port ${PORT}`);
  console.log('Inspection routes mounted at /inspections');
});