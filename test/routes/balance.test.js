/* global beforeAll, test, expect, describe */
/* eslint no-undef: "error" */

const request = require('supertest');

const moment = require('moment');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';

// eslint-disable-next-line operator-linebreak
const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTAxMDAsIm5hbWUiOiJVc2VyICMzIiwiZW1haWwiOiJ1c2VyXzNAZXhhbXBsZS5jb20ifQ.xjKJEzfES9WUsSpmNibmDIDq3iZpJLWSSAxnUxmMO4o';

/**
 * É necessário executar o seed antes dos testes.
 */
beforeAll(async () => {
  await app.db.seed.run();
});

describe('Ao calcular o saldo do usuário...', () => {
  test('Deve retornar apenas as contas com alguma transação', async () => {
    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('Deve adicionar valores de entrada', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: new Date(),
        ammount: 100.0,
        type: 'I',
        acc_id: 10100,
        status: true,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('100.00');
  });

  test('Deve subtratir valores de saída', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: new Date(),
        ammount: 200.0,
        type: 'O',
        acc_id: 10100,
        status: true,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('-100.00');
  });

  test('Não deve considerar transações pendentes', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: new Date(),
        ammount: 200.0,
        type: 'O',
        acc_id: 10100,
        status: false,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('-100.00');
  });

  test('Não deve considerar saldo de contas distintas', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: new Date(),
        ammount: 50.0,
        type: 'I',
        acc_id: 10101,
        status: true,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('-100.00');
    expect(res.body[1].id).toBe(10101);
    expect(res.body[1].sum).toBe('50.00');
  });

  test('Não deve considerar contas de outros usuários', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: new Date(),
        ammount: 200.0,
        type: 'O',
        acc_id: 10102,
        status: true,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('-100.00');
    expect(res.body[1].id).toBe(10101);
    expect(res.body[1].sum).toBe('50.00');
  });

  test('Deve considerar transação passada', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: moment().subtract({ days: 5 }),
        ammount: 250.0,
        type: 'I',
        acc_id: 10100,
        status: true,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('150.00');
    expect(res.body[1].id).toBe(10101);
    expect(res.body[1].sum).toBe('50.00');
  });

  test('Não deve considerar uma transação futura', async () => {
    await request(app)
      .post(ROUTE_TRANSACTION)
      .send({
        description: '1',
        date: moment().add({ days: 5 }),
        ammount: 250.0,
        type: 'I',
        acc_id: 10100,
        status: true,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('150.00');
    expect(res.body[1].id).toBe(10101);
    expect(res.body[1].sum).toBe('50.00');
  });

  test('Deve considerar transferências', async () => {
    await request(app)
      .post(ROUTE_TRANSFER)
      .send({
        description: '1',
        date: new Date(),
        ammount: 250.0,
        acc_ori_id: 10100,
        acc_dest_id: 10101,
      })
      .set('authorization', `bearer ${TOKEN}`);

    const res = await request(app)
      .get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(10100);
    expect(res.body[0].sum).toBe('-100.00');
    expect(res.body[1].id).toBe(10101);
    expect(res.body[1].sum).toBe('200.00');
  });
});
