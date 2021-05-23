module.exports = (app) => {
  /**
   * Rota que retorna todos os registros da tabela 'accounts'.
   * @returns [200] - objeto JSON contendo os registros da tabela.
   */
  const findAll = async (req, res) => {
    const accounts = await app.services.account.findAll();
    return res.status(200).json(accounts);
  };

  /**
   * Rota que adiciona uma nova conta.
   * @returns [201] - objeto JSON contendo o registro criado.
   * @returns [400] - bad request.
   */
  const create = async (req, res) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    try {
      const acc = req.body;
      const result = await app.services.account.save(acc);
      return res.status(201).json(result[0]);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  /**
   * Rota que retorna um registro através de seu ID.
   * @returns [200] - objeto JSON contendo o registro encontrado.
   */
  const findById = async (req, res) => {
    const result = await app.services.account.findById({ id: req.params.id });
    return res.status(200).json(result);
  };

  /**
   * Rota que atualiza um registro existente através de seu ID.
   * @returns [200] - objeto JSON contendo o registro atualizado.
   * @returns [400] - bad request.
   */
  const update = async (req, res) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    const result = await app.services.account.update(req.params.id, req.body);

    return res.status(200).json(result[0]);
  };

  /**
   * Rota que remove um registro existente através de seu ID.
   * @returns [204] - empty
   */
  const remove = async (req, res) => {
    await app.services.account.remove(req.params.id);
    return res.status(204).send();
  };

  return {
    findAll,
    create,
    findById,
    update,
    remove,
  };
};
