CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tasks (title, done)
SELECT 'Buy milk', FALSE
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Buy milk');

INSERT INTO tasks (title, done)
SELECT 'Finish assignment', FALSE
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Finish assignment');

INSERT INTO tasks (title, done)
SELECT 'Read HTTP docs', TRUE
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Read HTTP docs');
