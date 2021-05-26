const express = require('express');

const RecursoIndevidoError = require('../errors/RecursoIndevidoError');

module.exports = (app) => {
  const router = express.Router();

  /**
   * Middleware que captura todas as requisições com parâmetro 'id'.
   * Valida o 'id' do usuário logado para permitir as consultas.
   */
  router.param('id', async (req, res, next) => {
    try {
      const acc = await app.services.account.find({ id: req.params.id });

      // Verifica se o id da conta pertence ao usuário logado, obtido através
      // do token da requisição.
      if (acc.user_id !== req.user.id) {
        throw new RecursoIndevidoError();
      }
    } catch (error) {
      return next(error);
    }

    return next();
  });

  /**
   * Rota que retorna todos os registros da tabela 'accounts'.
   * @returns [200] - objeto JSON contendo os registros da tabela.
   */
  router.get('/', async (req, res, next) => {
    try {
      const accounts = await app.services.account.findAll(req.user.id);
      return res.status(200).json(accounts);
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Rota que adiciona uma nova conta.
   * @returns [201] - objeto JSON contendo o registro criado.
   * @returns [400] - bad request.
   */
  router.post('/', async (req, res, next) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    let result;

    try {
      result = await app.services.account.save({
        ...req.body,
        user_id: req.user.id,
      });
      return res.status(201).json(result[0]);
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Rota que retorna um registro através de seu ID.
   * @returns [200] - objeto JSON contendo o registro encontrado.
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.account.find({ id: req.params.id });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Rota que atualiza um registro existente através de seu ID.
   * @returns [200] - objeto JSON contendo o registro atualizado.
   * @returns [400] - bad request.
   */
  router.put('/:id', async (req, res, next) => {
    if (req.body == null) {
      return res.status(400).send();
    }

    try {
      const result = await app.services.account.update(req.params.id, req.body);
      return res.status(200).json(result[0]);
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Rota que remove um registro existente através de seu ID.
   * @returns [204] - empty
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.account.remove(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
