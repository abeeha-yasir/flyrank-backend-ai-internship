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

test('creates a task with the database assigned id', () => {
  const createdTask = taskService.createTask('Write docs');

  assert.equal(createdTask.id, 4);
  assert.deepStrictEqual(createdTask, { id: 4, title: 'Write docs', done: false });
  assert.equal(taskService.listTasks().length, 4);
});

test('updates a task in the database', () => {
  const updatedTask = taskService.updateTask(1, { title: 'Buy oat milk', done: true });

  assert.deepStrictEqual(updatedTask, { id: 1, title: 'Buy oat milk', done: true });
  assert.deepStrictEqual(taskService.getTaskById(1), { id: 1, title: 'Buy oat milk', done: true });
});

test('deletes a task from the database', () => {
  const deleted = taskService.deleteTask(1);

  assert.equal(deleted, true);
  assert.equal(taskService.getTaskById(1), null);
  assert.equal(taskService.listTasks().length, 2);
});

test('rejects invalid task updates and unknown task ids', () => {
  assert.throws(() => taskService.updateTask(999, { done: true }), (error) => error.statusCode === 404);
  assert.throws(() => taskService.updateTask(1, {}), (error) => error.statusCode === 400);
  assert.throws(() => taskService.deleteTask(999), (error) => error.statusCode === 404);
});
