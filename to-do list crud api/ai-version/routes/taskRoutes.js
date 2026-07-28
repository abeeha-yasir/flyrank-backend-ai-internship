const express = require('express');
const taskService = require('../services/taskService');

const router = express.Router();

router.get('/', (request, response) => {
  try {
    response.status(200).json(taskService.listTasks());
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/:id', (request, response) => {
  const task = taskService.getTaskById(Number(request.params.id));

  if (!task) {
    response.status(404).json({ error: 'Task not found' });
    return;
  }

  response.status(200).json(task);
});

router.post('/', (request, response) => {
  try {
    response.status(201).json(taskService.createTask(request.body.title));
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/:id', (request, response) => {
  try {
    response.status(200).json(taskService.updateTask(Number(request.params.id), request.body));
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete('/:id', (request, response) => {
  try {
    taskService.deleteTask(Number(request.params.id));
    response.status(204).send();
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;
