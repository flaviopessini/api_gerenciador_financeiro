module.exports = (app) => {
  const findAll = async (req, res) => {
    const users = await app.services.user.findAll();
    return res.status(200).json(users);
  };

  const create = async (req, res) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    const user = req.body;
    const result = await app.services.user.save(user);

    return res.status(201).json(result[0]);
  };

  return { findAll, create };
};
