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

test('Deve listar todas as contas', async () => {
  await app.db('accounts').insert({ name: 'Acc list', user_id: user.id });
  const res = await request(app).get(MAIN_ROUTE);
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

test('Deve retornar uma conta por ID', async () => {
  const acc = await app
    .db('accounts')
    .insert({ name: 'Acc By ID', user_id: user.id }, ['id']);
  const res = await request(app).get(`${MAIN_ROUTE}/${acc[0].id}`);
  expect(res.status).toBe(200);
  expect(res.body.name).toBe('Acc By ID');
  expect(res.body.user_id).toBe(user.id);
});

test('Deve alterar uma conta existente', async () => {
  const acc = await app
    .db('accounts')
    .insert({ name: 'Acc To Update', user_id: user.id }, ['id']);
  const res = await request(app)
    .put(`${MAIN_ROUTE}/${acc[0].id}`)
    .send({ name: 'Acc Updated' });
  expect(res.status).toBe(200);
  expect(res.body.name).toBe('Acc Updated');
});

test('Deve remover uma conta', async () => {
  const acc = await app
    .db('accounts')
    .insert({ name: 'Acc By ID', user_id: user.id }, ['id']);
  const res = await request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`);
  expect(res.status).toBe(204);
});
