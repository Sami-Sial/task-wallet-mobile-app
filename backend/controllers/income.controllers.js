const db = require('../database/db');
const { success, error } = require('../utils/response');

/* ========================= ADD INCOME ========================= */
exports.addIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            amount,
            category,
            notes,
            transaction_date
        } = req.body;

        if (!title || !amount || !category || !transaction_date)
            return error(res, 400, 'Title, amount, category and transaction date are required');

        if (amount <= 0)
            return error(res, 400, 'Amount must be greater than zero');

        await db.query(
            `INSERT INTO incomes
            (user_id, title, amount, category, notes, transaction_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title,
                amount,
                category,
                notes || null,
                transaction_date
            ]
        );

        return success(res, 201, 'Income added successfully');
    } catch (err) {
        console.error('Add Income Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= UPDATE INCOME ========================= */
exports.updateIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const { incomeId } = req.params;
        const {
            title,
            amount,
            category,
            notes,
            transaction_date
        } = req.body;

        if (!incomeId)
            return error(res, 400, 'Income ID is required');

        if (amount !== undefined && amount <= 0)
            return error(res, 400, 'Amount must be greater than zero');

        const [existing] = await db.query(
            `SELECT id FROM incomes WHERE id = ? AND user_id = ?`,
            [incomeId, userId]
        );

        if (!existing.length)
            return error(res, 404, 'Income not found');

        await db.query(
            `UPDATE incomes SET
                title = COALESCE(?, title),
                amount = COALESCE(?, amount),
                category = COALESCE(?, category),
                notes = COALESCE(?, notes),
                transaction_date = COALESCE(?, transaction_date)
             WHERE id = ? AND user_id = ?`,
            [
                title,
                amount,
                category,
                notes,
                transaction_date,
                incomeId,
                userId
            ]
        );

        return success(res, 200, 'Income updated successfully');
    } catch (err) {
        console.error('Update Income Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= DELETE INCOME ========================= */
exports.deleteIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const { incomeId } = req.params;

        const [result] = await db.query(
            `DELETE FROM incomes WHERE id = ? AND user_id = ?`,
            [incomeId, userId]
        );

        if (!result.affectedRows)
            return error(res, 404, 'Income not found');

        return success(res, 200, 'Income deleted successfully');
    } catch (err) {
        console.error('Delete Income Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= GET INCOMES ========================= */
exports.getIncomes = async (req, res) => {
    try {
        const userId = req.user.id;

        const [incomes] = await db.query(
            `SELECT 
                id,
                title,
                amount,
                category,
                notes,
                transaction_date,
                created_at
             FROM incomes
             WHERE user_id = ?
             ORDER BY transaction_date DESC`,
            [userId]
        );

        return success(res, 200, 'Incomes fetched successfully', incomes);
    } catch (err) {
        console.error('Get Incomes Error:', err);
        return error(res, 500, 'Internal server error');
    }
};
