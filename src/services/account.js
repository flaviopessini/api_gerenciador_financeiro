module.exports = (app) => {
  const findAll = (filter = {}) => {
    // Retorna todos os registros.
    return app.db('accounts').where(filter).select();
  };

  const save = (account) => {
    if (!account.name) {
      return { error: 'Nome é um atributo obrigatório' };
    }
    return app.db('accounts').insert(account, '*');
  };

  const findById = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };

  const update = (id, account) => {
    return app.db('accounts').where({ id }).update(account, '*');
  };

  const remove = (id) => {
    return app.db('accounts').where({ id }).del();
  };

  return {
    findAll,
    save,
    findById,
    update,
    remove,
  };
};
