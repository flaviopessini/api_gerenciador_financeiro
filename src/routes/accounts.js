module.exports = (app) => {
  const findAll = async (req, res) => {
    const accounts = await app.services.account.findAll();
    return res.status(200).json(accounts);
  };

  const create = async (req, res) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    const acc = req.body;
    const result = await app.services.account.save(acc);

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result[0]);
  };

  const findById = async (req, res) => {
    const result = await app.services.account.findById({ id: req.params.id });
    return res.status(200).json(result);
  };

  const update = async (req, res) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    const result = await app.services.account.update(req.params.id, req.body);

    return res.status(200).json(result[0]);
  };

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
