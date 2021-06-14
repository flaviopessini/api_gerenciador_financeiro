const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const winston = require('winston');
const uuid = require('uuidv4');

// Importa arquivo de configuração para o knex.
const knexFile = require('../knexfile');

// Atribui uma instância global do knex em 'app.db'.
app.db = knex(knexFile[process.env.NODE_ENV]);

app.log = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.json({ space: 1 }),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json({ space: 1 })
      ),
    }),
  ],
});

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
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

// Rota genérica para tratar erros.
app.use((err, req, res, next) => {
  const { name, message, stack } = err;

  if (name === 'ValidationError') {
    res.status(400).json({ error: message });
  } else if (name === 'RecursoIndevidoError') {
    res.status(403).json({ error: message });
  } else {
    const id = uuid();
    app.log.error({ id, name, message, stack });
    res.status(500).json({ id, error: 'Falha interna' });
  }

  next(err);
});

module.exports = app;
