const ValidationError = require('../errors/ValidationErrors');

module.exports = (app) => {
  /**
   * Retorna todos os registros da tabela.
   * @param {*} filter
   * @returns
   */
  const findAll = (userId) => {
    return app.db('accounts').where({ user_id: userId }).select();
  };

  /**
   * Busca um registro pelo ID.
   * @param {*} filter
   * @returns
   */
  const find = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };

  /**
   * Insere um novo registro.
   * @param {*} account
   * @returns
   */
  const save = async (account) => {
    if (!account.name) {
      throw new ValidationError('Nome é um atributo obrigatório');
    }

    const accExists = await find({
      name: account.name,
      user_id: account.user_id,
    });

    if (accExists) {
      throw new ValidationError('Já existe uma conta com esse nome');
    }

    return app.db('accounts').insert(account, '*');
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
  const remove = async (id) => {
    const transaction = await app.services.transaction.findOne({ acc_id: id });
    if (transaction) {
      throw new ValidationError('Essa conta possui transações associadas');
    }

    return app.db('accounts').where({ id }).del();
  };

  return {
    findAll,
    save,
    find,
    update,
    remove,
  };
};
