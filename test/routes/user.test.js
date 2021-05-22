const request = require('supertest');

const app = require('../../src/app');

const generatedEmail = `${Date.now()}@example.com`;
const generatedName = `John ${Math.floor(Math.random() * 100)}`;

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
  const data = {
    name: generatedName,
    email: generatedEmail,
    passwd: '123456',
  };
  const res = await request(app).post('/users').send(data);
  expect(res.status).toBe(201);
  expect(res.body.name).toBe(generatedName);
});

test('Não deve inserir usuário sem nome', async () => {
  const res = await request(app).post('/users').send({
    email: 'email@email.com',
    passwd: '123456',
  });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Nome é um atributo obrigatório');
});

test('Não deve inserir usuário sem email', async () => {
  const res = await request(app).post('/users').send({
    name: 'John Doe',
    passwd: '123456',
  });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir usuário sem senha', async () => {
  const res = await request(app).post('/users').send({
    name: 'John Doe',
    email: 'email@email.com',
  });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Senha é um atributo obrigatório');
});

test('Não deve inserir usuário com email já existente', async () => {
  const data = {
    name: generatedName,
    email: generatedEmail,
    passwd: '123456',
  };
  const res = await request(app).post('/users').send(data);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Já existe um usuário com esse email');
});
