const express = require('express');
// const logger = require('knex-logger');

const cors = require('cors');

module.exports = (app) => {
  app.use(express.json());
  // Implementa o log para as consultas do banco de dados.
  // app.use(logger(app.db));

  app.use(
    cors({
      origin: '*',
    })
  );
};
