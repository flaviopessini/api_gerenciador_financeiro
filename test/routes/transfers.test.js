const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';

// eslint-disable-next-line operator-linebreak
const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwiZW1haWwiOiJ1c2VyXzFAZXhhbXBsZS5jb20ifQ.mO6gC1kNjXYP9tjpvcKkp6Y6kb6o07skQ_WRwCyaO-0';

/**
 * É necessário executar o seed antes dos testes.
 */
beforeAll(async () => {
  // await app.db.migrate.rollback();
  // await app.db.migrate.latest();
  await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuário', async () => {
  const res = await request(app)
    .get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].description).toBe('Transfer #1');
});

// test('Deve inserir uma transferência com sucesso', async () => {
//   const res = await request(app)
//     .post(MAIN_ROUTE)
//     .set('authorization', `bearer ${TOKEN}`)
//     .send({
//       description: 'Regular transfer',
//       user_id: 10000,
//       acc_ori_id: 10000,
//       acc_dest_id: 10001,
//       ammount: 111.11,
//       date: new Date(),
//     });
//   expect(res.status).toBe(201);
//   expect(res.body.description).toBe('Regular transfer');

//   const transactions = await app
//     .db('transactions')
//     .where({ transfer_id: res.body.id });
//   expect(transactions).toHaveLength(2);
//   expect(transactions[0].description).toBe('Transfer to acc #10001');
//   expect(transactions[1].description).toBe('Transfer from acc #10000');
//   expect(transactions[0].ammount).toBe('-111.11');
//   expect(transactions[1].ammount).toBe('111.11');
//   expect(transactions[0].acc_id).toBe(10000);
//   expect(transactions[1].acc_id).toBe(10001);
// });

describe('Ao salvar uma transferência válida ...', () => {
  let transferId;
  let incoming;
  let outgoing;

  test('Deve retornar status 201 e os dados da transferência', async () => {
    const res = await request(app)
      .post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: 'Regular transfer',
        user_id: 10000,
        acc_ori_id: 10000,
        acc_dest_id: 10001,
        ammount: 111.11,
        date: new Date(),
      });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Regular transfer');
    transferId = res.body.id;
  });

  test('As transações devem ter sido geradas', async () => {
    const transactions = await app
      .db('transactions')
      .where({ transfer_id: transferId })
      .orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outgoing, incoming] = transactions;
  });

  test('A transação de saída deve ser negativa', () => {
    expect(outgoing.description).toBe('Transfer to acc #10001');
    expect(outgoing.ammount).toBe('-111.11');
    expect(outgoing.acc_id).toBe(10000);
    expect(outgoing.type).toBe('O');
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(incoming.description).toBe('Transfer from acc #10000');
    expect(incoming.ammount).toBe('111.11');
    expect(incoming.acc_id).toBe(10001);
    expect(incoming.type).toBe('I');
  });

  test('Ambas devem referenciar a transferência de origem', () => {
    expect(incoming.transfer_id).toBe(transferId);
    expect(outgoing.transfer_id).toBe(transferId);
  });
});
