const ValidationError = require('../errors/ValidationErrors');

module.exports = (app) => {
  const findAll = (filter = {}) => {
    // Retorna todos os registros.
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name) {
      throw new ValidationError('Nome é um atributo obrigatório');
    }
    if (!user.email) {
      throw new ValidationError('Email é um atributo obrigatório');
    }
    if (!user.passwd) {
      throw new ValidationError('Senha é um atributo obrigatório');
    }

    const exists = await findAll({ email: user.email });
    if (exists && exists.length > 0) {
      throw new ValidationError('Já existe um usuário com esse email');
    }

    // Insere um novo registro e retorna tudo que foi criado.
    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
