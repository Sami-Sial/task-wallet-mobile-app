const express = require('express');
const router = express.Router();

const {
    addIncome,
    updateIncome,
    deleteIncome,
    getIncomes
} = require('../controllers/income.controllers');

const auth = require('../middlewares/auth.middleware');

router.use(auth);


router.post('/', addIncome);
router.get('/', getIncomes);
router.put('/:incomeId', updateIncome);
router.delete('/:incomeId', deleteIncome);

module.exports = router;
