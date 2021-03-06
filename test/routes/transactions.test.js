/* global beforeAll, test, expect, describe */
/* eslint no-undef: "error" */

const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = 'D3F5F5F2E5428DCA56BA4892C7DA7';

const MAIN_ROUTE = '/v1/transactions';

let user;
let user2;
let accuser1;
let accuser2;

beforeAll(async () => {
  // Limpa os registros das tabelas
  await app.db('transactions').del();
  await app.db('transfers').del();
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
    '*'
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
    '*'
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

test('Transações de entrada devem ser positivas', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New Transaction',
      date: new Date(),
      ammount: -59.09,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    });

  expect(res.status).toBe(201);
  expect(res.body.acc_id).toBe(accuser1.id);
  expect(res.body.ammount).toBe('59.09');
});

test('Transações de saída devem ser negativas', async () => {
  const res = await request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New Transaction',
      date: new Date(),
      ammount: 120.0,
      type: 'O',
      status: false,
      acc_id: accuser1.id,
    });

  expect(res.status).toBe(201);
  expect(res.body.acc_id).toBe(accuser1.id);
  expect(res.body.ammount).toBe('-120.00');
});

describe('Ao tentar inserir uma transação inválida', () => {
  let validTransaction;

  // Executa antes de tudo ao entrar neste escopo describe().
  beforeAll(() => {
    // Preenche o objeto de transação para ser reutilizado pelos testes abaixo.
    validTransaction = {
      description: 'Valid Transaction',
      date: new Date(),
      ammount: 599.99,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    };
  });

  // Define um template para reutilizar código da requisição.
  const testTemplate = async (newData, errorMessage) => {
    const res = await request(app)
      .post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({ ...validTransaction, ...newData });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Não deve inserir sem descrição', () =>
    testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));

  test('Não deve inserir sem valor', () =>
    testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'));

  test('Não deve inserir sem data', () =>
    testTemplate({ date: null }, 'Data é um atributo obrigatório'));

  test('Não deve inserir sem conta', () =>
    testTemplate({ acc_id: null }, 'Conta é um atributo obrigatório'));

  test('Não deve inserir sem tipo', () =>
    testTemplate({ type: null }, 'Tipo é um atributo obrigatório'));

  test('Não deve inserir com tipo inválido', () =>
    testTemplate({ type: 'x' }, 'Tipo inválido'));
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
    ['id']
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
    ['id']
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

test('Deve remover uma trasação por ID', async () => {
  const tran = await app.db('transactions').insert(
    {
      description: 'to Delete',
      date: new Date(),
      ammount: 100.98,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    },
    ['id']
  );

  const res = await request(app)
    .delete(`${MAIN_ROUTE}/${tran[0].id}`)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(204);
});

test('Não deve remover uma transação de outro usuário', async () => {
  const tran = await app.db('transactions').insert(
    {
      description: 'to Delete',
      date: new Date(),
      ammount: 100.98,
      type: 'I',
      status: false,
      acc_id: accuser2.id,
    },
    ['id']
  );

  const res = await request(app)
    .delete(`${MAIN_ROUTE}/${tran[0].id}`)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Este recurso não pertence ao usuário');
});

test('Não deve remover conta com transações', async () => {
  await app.db('transactions').insert(
    {
      description: 'to Delete',
      date: new Date(),
      ammount: 100.98,
      type: 'I',
      status: false,
      acc_id: accuser1.id,
    },
    ['id']
  );

  const res = await request(app)
    .delete(`/v1/accounts/${accuser1.id}`)
    .set('authorization', `bearer ${user.token}`);

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Essa conta possui transações associadas');
});
