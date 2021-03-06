const ValidationError = require('../errors/ValidationErrors');

module.exports = (app) => {
  const find = (userId, filter = {}) =>
    app
      .db('transactions')
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();

  const findOne = (filter) => app.db('transactions').where(filter).first();

  const save = (transaction) => {
    if (!transaction.description) {
      throw new ValidationError('Descrição é um atributo obrigatório');
    } else if (!transaction.ammount) {
      throw new ValidationError('Valor é um atributo obrigatório');
    } else if (!transaction.date) {
      throw new ValidationError('Data é um atributo obrigatório');
    } else if (!transaction.type) {
      throw new ValidationError('Tipo é um atributo obrigatório');
    } else if (!(transaction.type === 'I' || transaction.type === 'O')) {
      throw new ValidationError('Tipo inválido');
    } else if (!transaction.acc_id) {
      throw new ValidationError('Conta é um atributo obrigatório');
    }
    const newTransaction = { ...transaction };
    if (
      // eslint-disable-next-line operator-linebreak
      (transaction.type === 'I' && transaction.ammount < 0) ||
      (transaction.type === 'O' && transaction.ammount > 0)
    ) {
      newTransaction.ammount *= -1;
    }
    return app.db('transactions').insert(newTransaction, '*');
  };

  const update = (id, transaction) =>
    app.db('transactions').where({ id }).update(transaction, '*');

  const remove = async (id) => {
    const transaction = await app.services.transaction.findOne({ acc_id: id });
    if (transaction) {
      throw new ValidationError('Essa conta possui transações associadas');
    }
    return app.db('transactions').where({ id }).del();
  };

  return {
    find,
    findOne,
    save,
    update,
    remove,
  };
};
