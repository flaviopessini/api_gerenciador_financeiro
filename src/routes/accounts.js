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

  return { findAll, create };
};
