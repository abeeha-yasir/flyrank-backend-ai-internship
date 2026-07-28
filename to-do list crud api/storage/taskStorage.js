const path = require('path');
const Database = require('better-sqlite3');

const seedTasks = [
  { title: 'Buy milk', done: false },
  { title: 'Finish assignment', done: false },
  { title: 'Read HTTP docs', done: true }
];

const databasePath = path.resolve(__dirname, '..', 'tasks.db');
const db = new Database(databasePath);

const rowToTask = (row) => ({ id: row.id, title: row.title, done: Boolean(row.done) });

const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);

  const rowCount = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;

  if (rowCount === 0) {
    const seed = db.transaction((tasksToSeed) => {
      const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
      tasksToSeed.forEach((task) => {
        insertTask.run(task.title, task.done ? 1 : 0);
      });
    });

    seed(seedTasks);
  }
};

initializeDatabase();

const getAllTasks = () => db.prepare('SELECT id, title, done FROM tasks ORDER BY id').all().map(rowToTask);

const resetTasks = () => {
  db.exec('DROP TABLE IF EXISTS tasks;');
  initializeDatabase();
  return getAllTasks();
};

const getTaskById = (taskId) => {
  const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(taskId);
  return row ? rowToTask(row) : null;
};

const createTask = (newTask) => {
  const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const result = insertTask.run(newTask.title, newTask.done ? 1 : 0);
  return { id: Number(result.lastInsertRowid), ...newTask };
};

const updateTask = (task) => {
  const updateTaskRow = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
  const result = updateTaskRow.run(task.title, task.done ? 1 : 0, task.id);

  if (result.changes === 0) {
    return null;
  }

  return { ...task };
};

const deleteTask = (taskId) => {
  const deleteTaskRow = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = deleteTaskRow.run(taskId);
  return result.changes > 0;
};

module.exports = {
  getAllTasks,
  resetTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
