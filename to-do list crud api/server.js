const express = require('express');

const app = express();
const port = 3000;

const apiInfo = {
  name: 'Task API',
  version: '1.0',
  endpoints: ['/tasks']
};

const tasks = [
  { id: 1, title: 'Buy milk', done: false },
  { id: 2, title: 'Finish assignment', done: false },
  { id: 3, title: 'Read HTTP docs', done: true }
];

app.get('/', (request, response) => {
  response.status(200).json(apiInfo);
});

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.get('/tasks', (request, response) => {
  response.status(200).json(tasks);
});

app.get('/tasks/:id', (request, response) => {
  const taskId = Number(request.params.id);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  response.status(200).json(task);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});