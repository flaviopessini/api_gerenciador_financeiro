const app = require('express')();
const consign = require('consign');
const knex = require('knex');
// const logger = require('knex-logger');

// TODO: criar dinâmico.
// Importa arquivo de configuração para o knex.
const knexFile = require('../knexfile');

// Atribui uma instância global do knex em 'app.db'.
app.db = knex(knexFile.test);

// Implementa o log para as consultas do banco de dados.
// app.use(logger(app.db));

consign({ cwd: 'src', verbose: false })
  .include('./config/middlewares.js')
  .then('./routes')
  .then('./config/routes.js')
  .into(app);

app.get('/', (req, res) => res.status(200).send());

/**
 * Listener para log das ações de query no knex.
 */
// app.db
//   .on('query', (query) => {
//     console.log({
//       sql: query.sql,
//       bindings: query.bindings ? query.bindings.join(', ') : '',
//     });
//   })
//   .on('query-response', (response) => {
//     console.log(response);
//   })
//   .on('error', (error) => {
//     console.error(error);
//   });

module.exports = app;
