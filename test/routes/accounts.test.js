const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = `eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYyMTk2Njc5MywiaWF0IjoxNjIxOTY2NzkzfQ.cSfSZaUkj69ioQAauRMT9ybI1x3aO07RKKv6g-n9dbY
`;

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

/**
 * Executa esta função antes de todos os tests.
 */
beforeEach(async () => {
  const res = await app.services.user.save({
    name: 'John Doe',
    email: `${Date.now()}@example.com`,
    passwd: '123456',
  });
  // Cria um novo usuário armazena o primeiro objeto do resultado em 'user'.
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);

  const res2 = await app.services.user.save({
    name: 'John Doe 2',
    email: `${Date.now()}@example.com`,
    passwd: '987654',
  });
  // Cria um seundo usuário para validar queries.
  user2 = { ...res2[0] };
});

test('Deve inserir uma conta com sucesso', async () => {
  const data = {
    name: 'Acc #1',
  };
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send(data)
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);
  expect(res.body.name).toBe('Acc #1');
});

test('Não deve inserir uma conta sem nome', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .send({})
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Nome é um atributo obrigatório');
});

// test('Deve listar todas as contas', async () => {
//   await app.db('accounts').insert({ name: 'Acc list', user_id: user.id });
//   const res = await request(app)
//     .get(MAIN_ROUTE)
//     .set('authorization', `bearer ${user.token}`);
//   expect(res.status).toBe(200);
//   expect(res.body.length).toBeGreaterThan(0);
// });

test('Deve listar apenas as contas pertencentes ao usuário', async () => {
  await app.db('accounts').insert([
    {
      name: user.name,
      user_id: user.id,
    },
    { name: user2.name, user_id: user2.id },
  ]);

  const res = await request(app)
    .get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0].name).toBe(user.name);
});

test('Não deve inserir uma conta com nome duplicado para o mesmo usuário', async () => {
  await app.db('accounts').insert({ name: 'Acc duplicada', user_id: user.id });

  const res = await request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      name: 'Acc duplicada',
    });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Já existe uma conta com esse nome');
});

test('Não deve retornar uma conta de outro usuário', async () => {
  const acc = await app
    .db('accounts')
    .insert({ name: user2.name, user_id: user2.id }, ['id']);

  const res = await request(app)
    .get(`${MAIN_ROUTE}/${acc[0].id}`)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Este recurso não pertence ao usuário');
});

test('Deve retornar uma conta por ID', async () => {
  const acc = await app
    .db('accounts')
    .insert({ name: 'Acc By ID', user_id: user.id }, ['id']);
  const res = await request(app)
    .get(`${MAIN_ROUTE}/${acc[0].id}`)
    .set('authorization', `bearer ${user.token}`);
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
    .send({ name: 'Acc Updated' })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(200);
  expect(res.body.name).toBe('Acc Updated');
});

test('Deve remover uma conta', async () => {
  const acc = await app
    .db('accounts')
    .insert({ name: 'Acc By ID', user_id: user.id }, ['id']);
  const res = await request(app)
    .delete(`${MAIN_ROUTE}/${acc[0].id}`)
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(204);
});
