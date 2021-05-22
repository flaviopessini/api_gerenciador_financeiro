const request = require('supertest');

const app = require('../../src/app');

test('Deve listar todos os usuários', async () => {
  const res = await request(app).get('/users');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0]).toHaveProperty('name', 'Flávio');
});

test('Deve inserir novo usuário com sucesso', async () => {
  const data = {
    name: 'John Doe',
    email: 'john_doe@gmail.com',
  };
  const res = await request(app).post('/users').send(data);
  expect(res.status).toBe(201);
  expect(res.body.name).toBe('John Doe');
});
