const express = require('express');
const taskService = require('../services/taskService');

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const tasks = await taskService.listTasks();
    response.status(200).json(tasks);
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/:id', async (request, response) => {
  try {
    const task = await taskService.getTaskById(Number(request.params.id));

    if (!task) {
      response.status(404).json({ error: 'Task not found' });
      return;
    }

    response.status(200).json(task);
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/', async (request, response) => {
  try {
    const newTask = await taskService.createTask(request.body.title);
    response.status(201).json(newTask);
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/:id', async (request, response) => {
  try {
    const updatedTask = await taskService.updateTask(Number(request.params.id), request.body);
    response.status(200).json(updatedTask);
  } catch (error) {
    if (error.statusCode === 404) {
      response.status(404).json({ error: error.message });
      return;
    }

    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete('/:id', async (request, response) => {
  try {
    await taskService.deleteTask(Number(request.params.id));
    response.status(204).send();
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;
