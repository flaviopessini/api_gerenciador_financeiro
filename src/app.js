const app = require('express')();
const consign = require('consign');
const knex = require('knex');

// TODO: criar dinâmico.
// Importa arquivo de configuração para o knex.
const knexFile = require('../knexfile');

// Atribui uma instância global do knex em 'app.db'.
app.db = knex(knexFile.test);

consign({ cwd: 'src', verbose: false })
  .include('./config/middlewares.js')
  .then('./services')
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

// Rota para HTTP 404 - NOT_FOUND
app.use((req, res, next) => {
  res.status(404).send('Sorry cant find that!');
  next();
});

// Rota para erro inesperado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

module.exports = app;
