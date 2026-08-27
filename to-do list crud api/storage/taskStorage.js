require('dotenv').config();
const { Pool } = require('pg');

const seedTasks = [
  { title: 'Buy milk', done: false },
  { title: 'Finish assignment', done: false },
  { title: 'Read HTTP docs', done: true }
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const rowToTask = (row) => ({ id: row.id, title: row.title, done: Boolean(row.done) });

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  const rowCountResult = await pool.query('SELECT COUNT(*)::int AS count FROM tasks');
  const rowCount = rowCountResult.rows[0].count;

  if (rowCount === 0) {
    const insertTask = 'INSERT INTO tasks (title, done) VALUES ($1, $2)';
    for (const task of seedTasks) {
      await pool.query(insertTask, [task.title, task.done]);
    }
  }
};

initializeDatabase().catch((error) => {
  console.error('Failed to initialize Postgres database:', error.message);
  process.exit(1);
});

const getAllTasks = async () => {
  const result = await pool.query('SELECT id, title, done FROM tasks ORDER BY id');
  return result.rows.map(rowToTask);
};

const resetTasks = async () => {
  await pool.query('DROP TABLE IF EXISTS tasks;');
  await initializeDatabase();
  return getAllTasks();
};

const getTaskById = async (taskId) => {
  const result = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [taskId]);
  return result.rows[0] ? rowToTask(result.rows[0]) : null;
};

const createTask = async (newTask) => {
  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING id, title, done',
    [newTask.title, newTask.done]
  );

  return rowToTask(result.rows[0]);
};

const updateTask = async (task) => {
  const result = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done',
    [task.title, task.done, task.id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return rowToTask(result.rows[0]);
};

const deleteTask = async (taskId) => {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  return result.rowCount > 0;
};

module.exports = {
  getAllTasks,
  resetTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
