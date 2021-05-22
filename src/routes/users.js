module.exports = () => {
  const findAll = (req, res) => {
    const data = [{ name: 'Flávio', email: 'abc@gmail.com' }];
    res.status(200).json(data);
  };

  const create = (req, res) => {
    const user = req.body;
    res.status(201).json(user);
  };

  return { findAll, create };
};
