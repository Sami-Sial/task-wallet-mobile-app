const db = require('../database/db');
const { success, error } = require('../utils/response');

/* ========================= ADD EXPENSE ========================= */
exports.addExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            amount,
            category,
            notes,
            transaction_date,
            payment_method
        } = req.body;

        if (!title || !amount || !category || !transaction_date)
            return error(res, 400, 'Title, amount, category and transaction date are required');

        if (amount <= 0)
            return error(res, 400, 'Amount must be greater than zero');

        await db.query(
            `INSERT INTO expenses
            (user_id, title, amount, category, notes, transaction_date, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title,
                amount,
                category,
                notes || null,
                transaction_date,
                payment_method || null
            ]
        );

        return success(res, 201, 'Expense added successfully');
    } catch (err) {
        console.error('Add Expense Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= UPDATE EXPENSE ========================= */
exports.updateExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const { expenseId } = req.params;
        const {
            title,
            amount,
            category,
            notes,
            transaction_date,
            payment_method
        } = req.body;

        if (!expenseId)
            return error(res, 400, 'Expense ID is required');

        if (amount !== undefined && amount <= 0)
            return error(res, 400, 'Amount must be greater than zero');

        const [existing] = await db.query(
            `SELECT id FROM expenses WHERE id = ? AND user_id = ?`,
            [expenseId, userId]
        );

        if (!existing.length)
            return error(res, 404, 'Expense not found');

        await db.query(
            `UPDATE expenses SET
                title = COALESCE(?, title),
                amount = COALESCE(?, amount),
                category = COALESCE(?, category),
                notes = COALESCE(?, notes),
                transaction_date = COALESCE(?, transaction_date),
                payment_method = COALESCE(?, payment_method)
             WHERE id = ? AND user_id = ?`,
            [
                title,
                amount,
                category,
                notes,
                transaction_date,
                payment_method,
                expenseId,
                userId
            ]
        );

        return success(res, 200, 'Expense updated successfully');
    } catch (err) {
        console.error('Update Expense Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= DELETE EXPENSE ========================= */
exports.deleteExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const { expenseId } = req.params;

        const [result] = await db.query(
            `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
            [expenseId, userId]
        );

        if (!result.affectedRows)
            return error(res, 404, 'Expense not found');

        return success(res, 200, 'Expense deleted successfully');
    } catch (err) {
        console.error('Delete Expense Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= GET EXPENSES ========================= */
exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;

        const [expenses] = await db.query(
            `SELECT 
                id,
                title,
                amount,
                category,
                notes,
                transaction_date,
                payment_method,
                created_at
             FROM expenses
             WHERE user_id = ?
             ORDER BY transaction_date DESC`,
            [userId]
        );

        return success(res, 200, 'Expenses fetched successfully', expenses);
    } catch (err) {
        console.error('Get Expenses Error:', err);
        return error(res, 500, 'Internal server error');
    }
};
