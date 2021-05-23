module.exports = (app) => {
  /**
   * Rota que retorna todos os registros da tabela 'accounts'.
   * @returns [200] - objeto JSON contendo os registros da tabela.
   */
  const findAll = async (req, res, next) => {
    try {
      const accounts = await app.services.account.findAll();
      return res.status(200).json(accounts);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Rota que adiciona uma nova conta.
   * @returns [201] - objeto JSON contendo o registro criado.
   * @returns [400] - bad request.
   */
  const create = async (req, res, next) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    let result;

    try {
      result = await app.services.account.save(req.body);
      return res.status(201).json(result[0]);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Rota que retorna um registro através de seu ID.
   * @returns [200] - objeto JSON contendo o registro encontrado.
   */
  const findById = async (req, res, next) => {
    try {
      const result = await app.services.account.findById({ id: req.params.id });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Rota que atualiza um registro existente através de seu ID.
   * @returns [200] - objeto JSON contendo o registro atualizado.
   * @returns [400] - bad request.
   */
  const update = async (req, res, next) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    try {
      const result = await app.services.account.update(req.params.id, req.body);
      return res.status(200).json(result[0]);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Rota que remove um registro existente através de seu ID.
   * @returns [204] - empty
   */
  const remove = async (req, res, next) => {
    try {
      await app.services.account.remove(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  return {
    findAll,
    create,
    findById,
    update,
    remove,
  };
};
