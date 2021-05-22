const request = require('supertest');

const app = require('../../src/app');

/**
 * test.skip
 * test.only
 */

test('Deve listar todos os usuários', async () => {
  const res = await request(app).get('/users');
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

test('Deve inserir novo usuário com sucesso', async () => {
  const randomEmail = `${Date.now()}@example.com`;
  const randomName = `John ${Math.floor(Math.random() * 100)}`;
  const data = {
    name: randomName,
    email: randomEmail,
    passwd: '123456',
  };
  const res = await request(app).post('/users').send(data);
  expect(res.status).toBe(201);
  expect(res.body.name).toBe(randomName);
});
