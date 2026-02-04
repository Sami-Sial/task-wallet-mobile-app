const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controllers');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.post('/', taskController.addTask);
router.get('/', taskController.getTasks);
router.put('/:taskId', taskController.updateTask);
router.patch('/:taskId/status', taskController.toggleTaskStatus);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
