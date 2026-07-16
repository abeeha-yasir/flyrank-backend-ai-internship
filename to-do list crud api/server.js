const express = require('express');

const app = express();
const port = 3000;

app.get('/', (request, response) => {
  response.status(200).send('Task API is running');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});