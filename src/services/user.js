module.exports = (app) => {
  const findAll = (filter = {}) => {
    // Retorna todos os registros.
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name) {
      return { error: 'Nome é um atributo obrigatório' };
    }
    if (!user.email) {
      return { error: 'Email é um atributo obrigatório' };
    }
    if (!user.passwd) {
      return { error: 'Senha é um atributo obrigatório' };
    }

    const exists = await findAll({ email: user.email });
    if (exists && exists.length > 0) {
      return { error: 'Já existe um usuário com esse email' };
    }

    // Insere um novo registro e retorna tudo que foi criado.
    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
