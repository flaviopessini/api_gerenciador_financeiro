const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.status(200).send());

app.get('/users', (req, res) => {
  const data = [{ name: 'Flávio', email: 'abc@gmail.com' }];
  return res.status(200).json(data);
});

module.exports = app;
