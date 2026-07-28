const test = require('node:test');
const assert = require('node:assert/strict');
const taskService = require('../services/taskService');
const taskStorage = require('../storage/taskStorage');

test.beforeEach(() => {
  taskStorage.resetTasks();
});

test('lists tasks from the database', () => {
  const tasks = taskService.listTasks();

  assert.equal(tasks.length, 3);
  assert.deepStrictEqual(tasks.map((task) => task.title), ['Buy milk', 'Finish assignment', 'Read HTTP docs']);
});

test('returns one task by id', () => {
  const task = taskService.getTaskById(1);

  assert.deepStrictEqual(task, { id: 1, title: 'Buy milk', done: false });
});

test('returns null for an unknown task id', () => {
  const task = taskService.getTaskById(999);

  assert.equal(task, null);
});
