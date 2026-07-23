const express = require('express');
const taskService = require('../services/taskService');

const router = express.Router();

router.get('/', (request, response) => {
  try {
    const tasks = taskService.listTasks({ done: request.query.done, search: request.query.search });
    response.status(200).json(tasks);
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/stats', (request, response) => {
  response.status(200).json(taskService.getStats());
});

router.post('/reset', (request, response) => {
  const tasks = taskService.resetTasks();
  response.status(200).json(tasks);
});

router.get('/:id', (request, response) => {
  const task = taskService.getTaskById(Number(request.params.id));

  if (!task) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  response.status(200).json(task);
});

router.post('/', (request, response) => {
  try {
    const newTask = taskService.createTask(request.body.title);
    response.status(201).json(newTask);
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/:id', (request, response) => {
  try {
    const updatedTask = taskService.updateTask(Number(request.params.id), request.body);
    response.status(200).json(updatedTask);
  } catch (error) {
    if (error.statusCode === 404) {
      response.status(404).json({ error: error.message });
      return;
    }

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
