const path = require('path');
const Database = require('better-sqlite3');

const databasePath = path.resolve(__dirname, '..', 'tasks.db');
const db = new Database(databasePath);

const seedTasks = [
  ['Buy milk', 0],
  ['Finish assignment', 0],
  ['Read HTTP docs', 1]
];

const toTask = (row) => ({ id: row.id, title: row.title, done: Boolean(row.done) });

const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);

  const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;
  if (count > 0) {
    return;
  }

  const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const seed = db.transaction((tasks) => {
    tasks.forEach((task) => insertTask.run(task[0], task[1]));
  });

  seed(seedTasks);
};

initializeDatabase();

const getAllTasks = () => db.prepare('SELECT id, title, done FROM tasks ORDER BY id').all().map(toTask);

const getTaskById = (taskId) => {
  const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(taskId);
  return row ? toTask(row) : null;
};

const createTask = (title) => {
  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  return { id: Number(result.lastInsertRowid), title, done: false };
};

const updateTask = (task) => {
  const result = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(task.title, task.done ? 1 : 0, task.id);
  return result.changes > 0 ? task : null;
};

const deleteTask = (taskId) => db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId).changes > 0;

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
