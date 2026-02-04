const express = require('express');
const router = express.Router();

const {
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenses
} = require('../controllers/expense.controllers');

const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.post('/', addExpense);
router.get('/', getExpenses);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

module.exports = router;
