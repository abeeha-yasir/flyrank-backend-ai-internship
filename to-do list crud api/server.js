const express = require('express');

const app = express();
const port = 3000;

const apiInfo = {
  name: 'Task API',
  version: '1.0',
  endpoints: ['/tasks']
};

app.get('/', (request, response) => {
  response.status(200).json(apiInfo);
});

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});