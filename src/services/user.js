module.exports = (app) => {
  const findAll = () => {
    // Retorna todos os registros.
    return app.db('users').select();
  };

  const save = (user) => {
    // Insere um novo registro e retorna tudo que foi criado.
    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
