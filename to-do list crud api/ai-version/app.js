const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());
app.use('/tasks', taskRoutes);

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

module.exports = app;
