const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const users = await app.services.user.findAll();
    return res.status(200).json(users);
  });

  router.post('/', async (req, res) => {
    if (!req.body || req.body == null) {
      return res.status(400).send();
    }

    try {
      const user = req.body;
      const result = await app.services.user.save(user);
      return res.status(201).json(result[0]);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  return router;
};
