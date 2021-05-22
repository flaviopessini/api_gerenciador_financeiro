module.exports = (app) => {
  const findAll = async (req, res) => {
    const users = await app.db('users').select();
    return res.status(200).json(users);
  };

  const create = async (req, res) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    const user = req.body;
    // Insere um novo registro e retorna tudo o que foi criado.
    const result = await app.db('users').insert(user, '*');

    return res.status(201).json(result[0]);
  };

  return { findAll, create };
};
