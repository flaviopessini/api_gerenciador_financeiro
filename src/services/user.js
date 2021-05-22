module.exports = (app) => {
  const findAll = () => {
    // Retorna todos os registros.
    return app.db('users').select();
  };

  const save = (user) => {
    if (!user.name) {
      return { error: 'Nome é um atributo obrigatório' };
    }
    // Insere um novo registro e retorna tudo que foi criado.
    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
