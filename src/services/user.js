const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationErrors');

module.exports = (app) => {
  const findAll = () => {
    // Retorna todos os registros.
    return app.db('users').select(['id', 'name', 'email']);
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
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

    const exists = await findOne({ email: user.email });
    if (exists) {
      throw new ValidationError('Já existe um usuário com esse email');
    }

    // Função que recebe a senha e devolve criptografada.
    const getPasswdHash = (passwd) => {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(passwd, salt);
    };

    // Instancia uma nova cópia do objeto user recebido para poder modificar sua estrutura.
    const newUser = { ...user };
    // Coloca senha criptografada dentro de user.
    newUser.passwd = getPasswdHash(user.passwd);

    // Insere um novo registro e retorna tudo que foi criado.
    return app.db('users').insert(newUser, ['id', 'name', 'email']);
  };

  return { findAll, findOne, save };
};
