const express = require('express');
// const logger = require('knex-logger');

module.exports = (app) => {
  app.use(express.json());
  // Implementa o log para as consultas do banco de dados.
  // app.use(logger(app.db));
};
