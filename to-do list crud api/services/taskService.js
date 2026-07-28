const taskStorage = require('../storage/taskStorage');

const getNextTaskId = (taskList) => (taskList.length > 0 ? Math.max(...taskList.map((task) => task.id)) + 1 : 1);

const listTasks = () => taskStorage.getAllTasks();

const getTaskById = (taskId) => taskStorage.getTaskById(taskId);

const createTask = (title) => {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle) {
    const error = new Error('Title is required');
    error.statusCode = 400;
    throw error;
  }

  const taskList = taskStorage.getAllTasks();
  const newTask = {
    id: getNextTaskId(taskList),
    title: trimmedTitle,
    done: false
  };

  taskStorage.createTask(newTask);
  return newTask;
};

const updateTask = (taskId, updates) => {
  const existingTask = taskStorage.getTaskById(taskId);

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

  taskStorage.updateTask(updatedTask);
  return updatedTask;
};

const deleteTask = (taskId) => {
  const existingTask = taskStorage.getTaskById(taskId);

  if (!existingTask) {
    const error = new Error(`Task ${taskId} not found`);
    error.statusCode = 404;
    throw error;
  }

  taskStorage.deleteTask(taskId);
  return true;
};

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
