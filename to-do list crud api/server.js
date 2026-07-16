const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi.json');

const app = express();
const port = 3000;

app.use(express.json());
app.get('/openapi.json', (request, response) => {
  response.status(200).json(openApiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

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

app.post('/tasks', (request, response) => {
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : '';

  if (!title) {
    response.status(400).json({ error: 'Title is required' });
    return;
  }

  const nextId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title,
    done: false
  };

  tasks.push(newTask);
  response.status(201).json(newTask);
});

app.put('/tasks/:id', (request, response) => {
  const taskId = Number(request.params.id);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(request.body, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(request.body, 'done');
  const title = hasTitle && typeof request.body.title === 'string' ? request.body.title.trim() : undefined;
  const done = hasDone && typeof request.body.done === 'boolean' ? request.body.done : undefined;

  if ((!hasTitle && !hasDone) || (hasTitle && title === '') || (hasDone && typeof request.body.done !== 'boolean')) {
    response.status(400).json({ error: 'Provide a valid title and/or done value' });
    return;
  }

  if (title !== undefined) {
    task.title = title;
  }

  if (done !== undefined) {
    task.done = done;
  }

  response.status(200).json(task);
});

app.delete('/tasks/:id', (request, response) => {
  const taskId = Number(request.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  tasks.splice(taskIndex, 1);
  response.status(204).send();
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    response.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  next(error);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});