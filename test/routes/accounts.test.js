const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

/**
 * Executa esta função antes de todos os tests.
 */
beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'John Doe',
    email: `${Date.now()}@example.com`,
    passwd: '123456',
  });
  // Cria um novo usuário armazena o primeiro objeto do resultado em 'user'.
  user = { ...res[0] };
});

test('Deve inserir uma conta com sucesso', async () => {
  const data = {
    name: 'Acc #1',
    user_id: user.id,
  };
  const res = await request(app).post(MAIN_ROUTE).send(data);
  expect(res.status).toBe(201);
  expect(res.body.name).toBe('Acc #1');
});
