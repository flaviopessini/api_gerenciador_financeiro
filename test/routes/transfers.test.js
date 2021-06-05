/* global beforeAll, test, expect, describe */
/* eslint no-undef: "error" */

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

describe('Ao tentar salvar uma transferência inválida ...', () => {
  const validTransfer = {
    description: 'Regular transfer',
    user_id: 10000,
    acc_ori_id: 10000,
    acc_dest_id: 10001,
    ammount: 111.11,
    date: new Date(),
  };

  const template = (newData, errorMessage) =>
    request(app)
      .post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validTransfer, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });

  test('Não deve inserir sem descrição', () =>
    template({ description: null }, 'Descrição é um atributo obrigatório'));

  test('Não deve inserir sem valor', () =>
    template({ ammount: null }, 'Valor é um atributo obrigatório'));

  test('Não deve inserir sem data', () =>
    template({ date: null }, 'Data é um atributo obrigatório'));

  test('Não deve inserir sem conta de origem', () =>
    template(
      { acc_ori_id: null },
      'Conta de origem é um atributo obrigatório'
    ));

  test('Não deve inserir sem conta de destino', () =>
    template(
      { acc_dest_id: null },
      'Conta de destino é um atributo obrigatório'
    ));

  test('Não deve inserir se as contas de origem e destino forem as mesmas', () =>
    template(
      { acc_dest_id: validTransfer.acc_ori_id },
      'Não é possível transferir para a mesma conta'
    ));

  test('Não deve inserir se as contas pertencerem a outro usuário', () =>
    template({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário'));
});

test('Deve retornar uma transferência por Id', async () => {
  const res = await request(app)
    .get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`);
  expect(res.status).toBe(200);
  expect(res.body.description).toBe('Transfer #1');
});

describe('Ao alterar uma transferência válida ...', () => {
  let transferId;
  let incoming;
  let outgoing;

  test('Deve retornar status 200 e os dados da transferência', async () => {
    const res = await request(app)
      .put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: 'Transfer Updated',
        user_id: 10000,
        acc_ori_id: 10000,
        acc_dest_id: 10001,
        ammount: 499.9,
        date: new Date(),
      });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Transfer Updated');
    expect(res.body.ammount).toBe('499.90');
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
    expect(outgoing.ammount).toBe('-499.90');
    expect(outgoing.acc_id).toBe(10000);
    expect(outgoing.type).toBe('O');
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(incoming.description).toBe('Transfer from acc #10000');
    expect(incoming.ammount).toBe('499.90');
    expect(incoming.acc_id).toBe(10001);
    expect(incoming.type).toBe('I');
  });

  test('Ambas devem referenciar a transferência de origem', () => {
    expect(incoming.transfer_id).toBe(transferId);
    expect(outgoing.transfer_id).toBe(transferId);
  });
});

describe('Ao tentar alterar uma transferência inválida ...', () => {
  const validTransfer = {
    description: 'Regular transfer',
    user_id: 10000,
    acc_ori_id: 10000,
    acc_dest_id: 10001,
    ammount: 111.11,
    date: new Date(),
  };

  const template = (newData, errorMessage) =>
    request(app)
      .put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validTransfer, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });

  test('Não deve inserir sem descrição', () =>
    template({ description: null }, 'Descrição é um atributo obrigatório'));

  test('Não deve inserir sem valor', () =>
    template({ ammount: null }, 'Valor é um atributo obrigatório'));

  test('Não deve inserir sem data', () =>
    template({ date: null }, 'Data é um atributo obrigatório'));

  test('Não deve inserir sem conta de origem', () =>
    template(
      { acc_ori_id: null },
      'Conta de origem é um atributo obrigatório'
    ));

  test('Não deve inserir sem conta de destino', () =>
    template(
      { acc_dest_id: null },
      'Conta de destino é um atributo obrigatório'
    ));

  test('Não deve inserir se as contas de origem e destino forem as mesmas', () =>
    template(
      { acc_dest_id: validTransfer.acc_ori_id },
      'Não é possível transferir para a mesma conta'
    ));

  test('Não deve inserir se as contas pertencerem a outro usuário', () =>
    template({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário'));
});

describe('Ao remover transferência', () => {
  test('Deve retornar o status 204', async () => {
    const res = await request(app)
      .delete(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });

  test('O registro deve ser apagado do banco', async () => {
    const res = await app.db('transfers').where({ id: 10000 }).select();
    expect(res).toHaveLength(0);
  });

  test('As transações associadas devem ter sido removidas', async () => {
    const res = await app
      .db('transactions')
      .where({ transfer_id: 10000 })
      .select();
    expect(res).toHaveLength(0);
  });
});

test('Não deve retornar transferência de outro usuário', async () => {
  const res = await request(app)
    .get(`${MAIN_ROUTE}/10001`)
    .set('authorization', `bearer ${TOKEN}`);
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Este recurso não pertence ao usuário');
});
