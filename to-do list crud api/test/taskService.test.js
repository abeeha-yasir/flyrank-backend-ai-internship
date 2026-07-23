const test = require('node:test');
const assert = require('node:assert/strict');
const taskService = require('../services/taskService');

test('lists and filters tasks', () => {
  taskService.resetTasks();

  const tasks = taskService.listTasks({ done: false, search: 'milk' });

  assert.deepStrictEqual(tasks.map((task) => task.title), ['Buy milk']);
});

test('creates and updates a task while tracking stats', () => {
  taskService.resetTasks();

  const createdTask = taskService.createTask('Write docs');
  const updatedTask = taskService.updateTask(createdTask.id, { done: true });
  const stats = taskService.getStats();

  assert.equal(createdTask.id, 4);
  assert.equal(updatedTask.done, true);
  assert.deepStrictEqual(stats, { total: 4, done: 2, open: 2 });
});
