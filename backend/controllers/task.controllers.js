const db = require('../database/db');
const { success, error } = require('../utils/response');

/* ========================= ADD TASK ========================= */
exports.addTask = async (req, res) => {
    try {
        const userId = req.user.id;
        let { title, description, category, due_date, priority } = req.body;

        if (!title || !category)
            return error(res, 400, 'Title and category are required');

        if (priority && !['high', 'medium', 'low'].includes(priority))
            return error(res, 400, 'Invalid priority value');

        due_date = new Date(due_date).toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        await db.query(
            `INSERT INTO tasks 
            (user_id, title, description, category, due_date, priority)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title,
                description || null,
                category,
                due_date || null,
                priority || 'medium'
            ]
        );

        return success(res, 201, 'Task created successfully');
    } catch (err) {
        console.error('Add Task Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= UPDATE TASK ========================= */
exports.updateTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;
        const { title, description, category, due_date, priority, status } = req.body;

        if (!taskId)
            return error(res, 400, 'Task ID is required');

        if (priority && !['high', 'medium', 'low'].includes(priority))
            return error(res, 400, 'Invalid priority value');

        const [existing] = await db.query(
            `SELECT id FROM tasks WHERE id = ? AND user_id = ?`,
            [taskId, userId]
        );

        if (!existing.length)
            return error(res, 404, 'Task not found');

        await db.query(
            `UPDATE tasks SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                category = COALESCE(?, category),
                due_date = COALESCE(?, due_date),
                priority = COALESCE(?, priority),
                status = COALESCE(?, status)
             WHERE id = ? AND user_id = ?`,
            [
                title,
                description,
                category,
                due_date,
                priority,
                status,
                taskId,
                userId
            ]
        );

        return success(res, 200, 'Task updated successfully');
    } catch (err) {
        console.error('Update Task Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= DELETE TASK ========================= */
exports.deleteTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;

        if (!taskId)
            return error(res, 400, 'Task ID is required');

        const [result] = await db.query(
            `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
            [taskId, userId]
        );

        if (!result.affectedRows)
            return error(res, 404, 'Task not found');

        return success(res, 200, 'Task deleted successfully');
    } catch (err) {
        console.error('Delete Task Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= GET ALL TASKS ========================= */
exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;

        const [tasks] = await db.query(
            `SELECT 
                id, title, description, category, due_date, priority, status,
                created_at, updated_at
             FROM tasks
             WHERE user_id = ?
             ORDER BY due_date ASC`,
            [userId]
        );

        return success(res, 200, 'Tasks fetched successfully', tasks);
    } catch (err) {
        console.error('Get Tasks Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

/* ========================= TOGGLE TASK STATUS ========================= */
exports.toggleTaskStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;

        const [result] = await db.query(
            `UPDATE tasks
             SET status = CASE 
                            WHEN status = 'pending' THEN 'completed'
                            ELSE 'pending'
                          END
             WHERE id = ? AND user_id = ?`,
            [taskId, userId]
        );

        if (!result.affectedRows)
            return error(res, 404, 'Task not found');

        return success(res, 200, 'Task status updated');
    } catch (err) {
        console.error('Toggle Task Status Error:', err);
        return error(res, 500, 'Internal server error');
    }
};

