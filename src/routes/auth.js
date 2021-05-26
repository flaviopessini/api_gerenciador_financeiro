const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const ValidationErrors = require('../errors/ValidationErrors');

const secret = `eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYyMTk2Njc5MywiaWF0IjoxNjIxOTY2NzkzfQ.cSfSZaUkj69ioQAauRMT9ybI1x3aO07RKKv6g-n9dbY
`;

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', async (req, res, next) => {
    try {
      const user = await app.services.user.findOne({ email: req.body.email });

      if (!user || !bcrypt.compareSync(req.body.passwd, user.passwd)) {
        // Se nenhum usuário foi encontrado ou a senha não combina, retorna um erro.
        throw new ValidationErrors('Usuário ou senha inválidos');
      }

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      const token = jwt.encode(payload, secret);

      return res.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/signup', async (req, res) => {
    if (req.body == null) {
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