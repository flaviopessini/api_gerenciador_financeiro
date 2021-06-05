const express = require('express');

const RecursoIndevidoError = require('../errors/RecursoIndevidoError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    try {
      const result = await app.services.transfer.findOne({ id: req.params.id });
      if (result.user_id !== req.user.id) {
        throw new RecursoIndevidoError();
      }
    } catch (error) {
      return next(error);
    }

    return next();
  });

  const validate = (req, res, next) => {
    app.services.transfer
      .validate({ ...req.body, user_id: req.user.id })
      .then(() => next())
      .catch((error) => next(error));
  };

  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.transfer.find({ user_id: req.user.id });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', validate, async (req, res, next) => {
    try {
      const transfer = { ...req.body, user_id: req.user.id };
      const result = await app.services.transfer.save(transfer);
      return res.status(201).json(result[0]);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.transfer.findOne({
        id: req.params.id,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.put('/:id', validate, async (req, res, next) => {
    try {
      const result = await app.services.transfer.update(req.params.id, {
        ...req.body,
        user_id: req.user_id,
      });
      return res.status(200).json(result[0]);
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.transfer.remove(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
