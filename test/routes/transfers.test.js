const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';

// eslint-disable-next-line operator-linebreak
const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwiZW1haWwiOiJ1c2VyXzFAZXhhbXBsZS5jb20ifQ.mO6gC1kNjXYP9tjpvcKkp6Y6kb6o07skQ_WRwCyaO-0';

/**
 * É necessário executar o seed antes dos testes.
 */
beforeAll(async () => {
  // await app.db.migrate.rollback();
  // await app.db.migrate.latest();
  await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuário', async () => {
  const res = await request(app)
    .get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].description).toBe('Transfer #1');
});
