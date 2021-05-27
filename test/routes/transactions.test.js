const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = `eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYyMTk2Njc5MywiaWF0IjoxNjIxOTY2NzkzfQ.cSfSZaUkj69ioQAauRMT9ybI1x3aO07RKKv6g-n9dbY
`;

const MAIN_ROUTE = '/v1/transactions';

let user;
let user2;
let accuser1;
let accuser2;

beforeAll(async () => {
  // Limpa os registros das tabelas
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();

  // Cria 2 usuários direto no banco, para teste.
  const users = await app.db('users').insert(
    [
      {
        name: 'User #1',
        email: 'user_1@example.com',
        passwd: '$2y$10$sye4/ssJBAGdUOikLuOCjeTAbiKiqWAu/VlXnLN1dBlVmb.l3FFwO ',
      },
      {
        name: 'User #2',
        email: 'user_2@example.com',
        passwd: '$2y$10$sye4/ssJBAGdUOikLuOCjeTAbiKiqWAu/VlXnLN1dBlVmb.l3FFwO ',
      },
    ],
    '*',
  );

  // Preenche as variáveis globais com os objetos de usuário retornados na consulta.
  [user, user2] = users;

  // Remove a propriedade passwd dos objetos de usuários para manter
  // a integridade do payload no token.
  delete user.passwd;
  delete user2.passwd;

  // Define o token para o usuário.
  user.token = jwt.encode(user, secret);

  // Cria 2 contas para os usuários direto no banco.
  const accs = await app.db('accounts').insert(
    [
      { name: 'Acc #1', user_id: user.id },
      { name: 'Acc #2', user_id: user2.id },
    ],
    '*',
  );

  // Preenche as contas com os objetos de account retornados.
  [accuser1, accuser2] = accs;
});

test('Deve listar apenas as transações do usuário', async () => {
  await app.db('transactions').insert([
    {
      description: 'Transação do usuário 1',
      date: new Date(),
      ammount: 100.0,
      type: 'I',
      acc_id: accuser1.id,
    },
    {
      description: 'Transação do usuário 2',
      date: new Date(),
      ammount: 200.0,
      type: 'O',
      acc_id: accuser2.id,
    },
  ]);

  const res = await request(app)
    .get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].description).toBe('Transação do usuário 1');
});

test('Deve inserir uma transação com sucesso', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New Transaction',
      date: new Date(),
      ammount: 150.0,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    });

  expect(res.status).toBe(201);
  expect(res.body.acc_id).toBe(accuser1.id);
});

test('Deve retornar uma transação por ID', async () => {
  const tran = await app.db('transactions').insert(
    {
      description: 'T ID',
      date: new Date(),
      ammount: 150.0,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    },
    ['id'],
  );

  const res = await request(app)
    .get(`${MAIN_ROUTE}/${tran[0].id}`)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(tran[0].id);
  expect(res.body.description).toBe('T ID');
});

test('Deve alterar uma trasação por ID', async () => {
  const tran = await app.db('transactions').insert(
    {
      description: 'to Update',
      date: new Date(),
      ammount: 199.98,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    },
    ['id'],
  );

  const res = await request(app)
    .put(`${MAIN_ROUTE}/${tran[0].id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({ description: 'Updated', ammount: 9123.99, status: true });

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(tran[0].id);
  expect(res.body.description).toBe('Updated');
  expect(res.body.status).toBe(true);
});
