const taskStorage = require('../storage/taskStorage');

const listTasks = () => taskStorage.getAllTasks();

const getTaskById = (taskId) => taskStorage.getTaskById(taskId);

const createTask = (title) => {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle) {
    const error = new Error('Title is required');
    error.statusCode = 400;
    throw error;
  }

  return taskStorage.createTask(trimmedTitle);
};

const updateTask = (taskId, updates) => {
  const currentTask = taskStorage.getTaskById(taskId);

  if (!currentTask) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const title = typeof updates.title === 'string' ? updates.title.trim() : undefined;
  const done = typeof updates.done === 'boolean' ? updates.done : undefined;
  const hasChange = title !== undefined || done !== undefined;

  if (!hasChange || title === '') {
    const error = new Error('Provide a valid title and/or done value');
    error.statusCode = 400;
    throw error;
  }

  return taskStorage.updateTask({
    id: taskId,
    title: title !== undefined ? title : currentTask.title,
    done: done !== undefined ? done : currentTask.done
  });
};

const deleteTask = (taskId) => {
  if (!taskStorage.deleteTask(taskId)) {
    const error = new Error('Task not found');
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
