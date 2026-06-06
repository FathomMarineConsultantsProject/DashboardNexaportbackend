"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileRoutes = require('./routes/files');
const scheduleRoutes = require('./routes/schedules');
const rightshipRoutes = require('./routes/rightship');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/files', fileRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/rightship', rightshipRoutes);
app.use('/user', userRoutes);
app.use('/expenses', expenseRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`TypeScript Server running smoothly on port ${PORT}`);
});
//# sourceMappingURL=server.js.map