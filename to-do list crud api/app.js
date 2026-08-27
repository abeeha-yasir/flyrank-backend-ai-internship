const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { createClient } = require('redis');
const openApiSpec = require('./openapi.json');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redisClient.on('error', (error) => {
  console.error('Redis Client Error', error);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  }
})();

app.use(express.json());
app.get('/openapi.json', (request, response) => {
  response.status(200).json(openApiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get('/', (request, response) => {
  response.status(200).json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks']
  });
});

app.get('/health', async (request, response) => {
  try {
    await redisClient.ping();
    response.status(200).json({ status: 'ok', redis: 'ok' });
  } catch (error) {
    response.status(503).json({ status: 'error', redis: 'unavailable' });
  }
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
