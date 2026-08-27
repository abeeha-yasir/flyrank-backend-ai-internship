const test = require('node:test');
const assert = require('node:assert/strict');
const taskService = require('../services/taskService');
const taskStorage = require('../storage/taskStorage');

test.beforeEach(async () => {
  await taskStorage.resetTasks();
});

test('lists tasks from the database', async () => {
  const tasks = await taskService.listTasks();

  assert.equal(tasks.length, 3);
  assert.deepStrictEqual(tasks.map((task) => task.title), ['Buy milk', 'Finish assignment', 'Read HTTP docs']);
});

test('returns one task by id', async () => {
  const task = await taskService.getTaskById(1);

  assert.deepStrictEqual(task, { id: 1, title: 'Buy milk', done: false });
});

test('returns null for an unknown task id', async () => {
  const task = await taskService.getTaskById(999);

  assert.equal(task, null);
});

test('creates a task with the database assigned id', async () => {
  const createdTask = await taskService.createTask('Write docs');

  assert.equal(createdTask.id, 4);
  assert.deepStrictEqual(createdTask, { id: 4, title: 'Write docs', done: false });
  assert.equal((await taskService.listTasks()).length, 4);
});

test('updates a task in the database', async () => {
  const updatedTask = await taskService.updateTask(1, { title: 'Buy oat milk', done: true });

  assert.deepStrictEqual(updatedTask, { id: 1, title: 'Buy oat milk', done: true });
  assert.deepStrictEqual(await taskService.getTaskById(1), { id: 1, title: 'Buy oat milk', done: true });
});

test('deletes a task from the database', async () => {
  const deleted = await taskService.deleteTask(1);

  assert.equal(deleted, true);
  assert.equal(await taskService.getTaskById(1), null);
  assert.equal((await taskService.listTasks()).length, 2);
});

test('rejects invalid task updates and unknown task ids', async () => {
  await assert.rejects(() => taskService.updateTask(999, { done: true }), (error) => error.statusCode === 404);
  await assert.rejects(() => taskService.updateTask(1, {}), (error) => error.statusCode === 400);
  await assert.rejects(() => taskService.deleteTask(999), (error) => error.statusCode === 404);
});
