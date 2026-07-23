const seedTasks = [
  { id: 1, title: 'Buy milk', done: false },
  { id: 2, title: 'Finish assignment', done: false },
  { id: 3, title: 'Read HTTP docs', done: true }
];

let tasks = seedTasks.map((task) => ({ ...task }));

const cloneTasks = (taskList) => taskList.map((task) => ({ ...task }));

const getAllTasks = () => cloneTasks(tasks);

const resetTasks = () => {
  tasks = cloneTasks(seedTasks);
  return getAllTasks();
};

const getTaskById = (taskId) => tasks.find((task) => task.id === taskId);

const createTask = (newTask) => {
  tasks.push(newTask);
  return { ...newTask };
};

const updateTask = (task) => {
  const taskIndex = tasks.findIndex((item) => item.id === task.id);

  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = { ...task };
  return { ...tasks[taskIndex] };
};

const deleteTask = (taskId) => {
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  return true;
};

module.exports = {
  getAllTasks,
  resetTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
