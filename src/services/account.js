const ValidationError = require('../errors/ValidationErrors');

module.exports = (app) => {
  /**
   * Retorna todos os registros da tabela.
   * @param {*} filter
   * @returns
   */
  const findAll = (filter = {}) => {
    return app.db('accounts').where(filter).select();
  };

  /**
   * Insere um novo registro.
   * @param {*} account
   * @returns
   */
  const save = (account) => {
    if (!account.name) {
      throw new ValidationError('Nome é um atributo obrigatório');
    }
    return app.db('accounts').insert(account, '*');
  };

  /**
   * Busca um registro pelo ID.
   * @param {*} filter
   * @returns
   */
  const findById = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };

  /**
   * Atualiza um registro existente pelo ID.
   * @param {*} id
   * @param {*} account
   * @returns
   */
  const update = (id, account) => {
    return app.db('accounts').where({ id }).update(account, '*');
  };

  /**
   * Remove um registro existente.
   * @param {*} id
   * @returns
   */
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
