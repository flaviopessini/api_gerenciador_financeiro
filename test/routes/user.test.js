/* global beforeAll, test, expect */
/* eslint no-undef: "error" */

const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = 'D3F5F5F2E5428DCA56BA4892C7DA7';

const generatedEmail = `${Date.now()}@example.com`;
const generatedName = `John ${Math.floor(Math.random() * 100)}`;

const MAIN_ROUTE = '/v1/users';
let user;

/**
 * test.skip
 * test.only
 */

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
  user.token = jwt.encode(user, secret);
});

test('Deve inserir novo usuário com sucesso', async () => {
  const data = {
    name: generatedName,
    email: generatedEmail,
    passwd: '123456',
  };
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send(data)
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);
  expect(res.body.name).toBe(generatedName);
  expect(res.body).not.toHaveProperty('passwd');
});

test('Deve armazenar senha criptografada', async () => {
  const data = {
    name: generatedName,
    email: `${Date.now()}@criptografada.com`,
    passwd: '123456',
  };
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send(data)
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;

  const userDB = await app.services.user.findOne({ id });

  expect(userDB.passwd).not.toBeUndefined();
  expect(userDB.passwd).not.toBe(data.passwd);
});

test('Deve listar todos os usuários', async () => {
  const res = await request(app)
    .get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
  expect(res.body).not.toHaveProperty('passwd');
});

test('Não deve inserir usuário sem nome', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send({
      email: 'email@email.com',
      passwd: '123456',
    })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Nome é um atributo obrigatório');
});

test('Não deve inserir usuário sem email', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'John Doe',
      passwd: '123456',
    })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir usuário sem senha', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send({
      name: 'John Doe',
      email: 'email@email.com',
    })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Senha é um atributo obrigatório');
});

test('Não deve inserir usuário com email já existente', async () => {
  const data = {
    name: generatedName,
    email: generatedEmail,
    passwd: '123456',
  };
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send(data)
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Já existe um usuário com esse email');
});
