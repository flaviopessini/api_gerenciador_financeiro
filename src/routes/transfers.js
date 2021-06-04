const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.transfer.find({ user_id: req.user.id });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const transfer = { ...req.body, user_id: req.user.id };
      const result = await app.services.transfer.save(transfer);
      return res.status(201).json(result[0]);
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
