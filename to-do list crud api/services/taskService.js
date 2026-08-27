const taskStorage = require('../storage/taskStorage');

const listTasks = async () => taskStorage.getAllTasks();

const getTaskById = async (taskId) => taskStorage.getTaskById(taskId);

const createTask = async (title) => {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle) {
    const error = new Error('Title is required');
    error.statusCode = 400;
    throw error;
  }

  return taskStorage.createTask({
    title: trimmedTitle,
    done: false
  });
};

const updateTask = async (taskId, updates) => {
  const existingTask = await taskStorage.getTaskById(taskId);

  if (!existingTask) {
    const error = new Error(`Task ${taskId} not found`);
    error.statusCode = 404;
    throw error;
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(updates, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(updates, 'done');
  const title = hasTitle && typeof updates.title === 'string' ? updates.title.trim() : undefined;
  const done = hasDone && typeof updates.done === 'boolean' ? updates.done : undefined;

  if ((!hasTitle && !hasDone) || (hasTitle && title === '') || (hasDone && typeof updates.done !== 'boolean')) {
    const error = new Error('Provide a valid title and/or done value');
    error.statusCode = 400;
    throw error;
  }

  const updatedTask = {
    ...existingTask,
    ...(title !== undefined ? { title } : {}),
    ...(done !== undefined ? { done } : {})
  };

  const result = await taskStorage.updateTask(updatedTask);
  if (!result) {
    const error = new Error(`Task ${taskId} not found`);
    error.statusCode = 404;
    throw error;
  }

  return updatedTask;
};

const deleteTask = async (taskId) => {
  const existingTask = await taskStorage.getTaskById(taskId);

  if (!existingTask) {
    const error = new Error(`Task ${taskId} not found`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = await taskStorage.deleteTask(taskId);
  if (!deleted) {
    const error = new Error(`Task ${taskId} not found`);
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
