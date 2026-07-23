const taskStorage = require('../storage/taskStorage');

const parseBooleanQuery = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
};

const getNextTaskId = (taskList) => (taskList.length > 0 ? Math.max(...taskList.map((task) => task.id)) + 1 : 1);

const listTasks = ({ done, search } = {}) => {
  const doneFilter = parseBooleanQuery(done);
  const searchQuery = typeof search === 'string' ? search.trim().toLowerCase() : '';

  if (doneFilter === null) {
    const error = new Error('done must be true or false');
    error.statusCode = 400;
    throw error;
  }

  let filteredTasks = taskStorage.getAllTasks();

  if (doneFilter !== undefined) {
    filteredTasks = filteredTasks.filter((task) => task.done === doneFilter);
  }

  if (searchQuery) {
    filteredTasks = filteredTasks.filter((task) => task.title.toLowerCase().includes(searchQuery));
  }

  return filteredTasks;
};

const getStats = () => {
  const tasks = taskStorage.getAllTasks();
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return { total, done, open: total - done };
};

const resetTasks = () => taskStorage.resetTasks();

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
  parseBooleanQuery,
  listTasks,
  getStats,
  resetTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
