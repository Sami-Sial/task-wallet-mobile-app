
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');
const incomeRoutes = require('./routes/income.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================== MIDDLEWARE ===================== */
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== ROUTES ===================== */
app.get('/', (req, res) => {
    res.status(200).json({ status: 200, success: true, message: 'API running ✅' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/task', taskRoutes);

/* ===================== 404 HANDLER ===================== */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

/* ===================== GLOBAL ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

/* ===================== SERVER START ===================== */
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
