const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi.json');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());
app.get('/openapi.json', (request, response) => {
  response.status(200).json(openApiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get('/', (request, response) => {
  response.status(200).json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks', '/stats', '/reset']
  });
});

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    response.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  next(error);
});

module.exports = app;
