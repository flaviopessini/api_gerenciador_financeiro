module.exports = (app) => {
  const findAll = (filter = {}) => {
    // Retorna todos os registros.
    return app.db('accounts').where(filter).select();
  };

  const save = (account) => {
    return app.db('accounts').insert(account, '*');
  };

  const findById = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };

  const update = (id, account) => {
    return app.db('accounts').where({ id }).update(account, '*');
  };

  return {
    findAll,
    save,
    findById,
    update,
  };
};
