const moment = require('moment');

exports.seed = (knex) =>
  knex('users')
    .insert([
      {
        id: 10100,
        name: 'User #3',
        email: 'user_3@example.com',
        passwd: '$2a$10$rD7/4wT0dOyClbXSh9tCZuzGPXMk6kxrvC3DNmFW9W.f30jhOHote',
      },
      {
        id: 10101,
        name: 'User #4',
        email: 'user_4@example.com',
        passwd: '$2a$10$rD7/4wT0dOyClbXSh9tCZuzGPXMk6kxrvC3DNmFW9W.f30jhOHote',
      },
      {
        id: 10102,
        name: 'User #5',
        email: 'user_5@example.com',
        passwd: '$2a$10$rD7/4wT0dOyClbXSh9tCZuzGPXMk6kxrvC3DNmFW9W.f30jhOHote',
      },
    ])
    .then(() =>
      knex('accounts').insert([
        { id: 10100, name: 'Acc Saldo Principal', user_id: 10100 },
        { id: 10101, name: 'Acc Saldo Secundário', user_id: 10100 },
        { id: 10102, name: 'Acc Alternativa 1', user_id: 10101 },
        { id: 10103, name: 'Acc Alternativa 2', user_id: 10101 },
        { id: 10104, name: 'Acc Geral Principal', user_id: 10102 },
        { id: 10105, name: 'Acc Geral Secundário', user_id: 10102 },
      ])
    )
    .then(() =>
      knex('transfers').insert([
        {
          id: 10100,
          description: 'Transfer #1',
          user_id: 10102,
          acc_ori_id: 10105,
          acc_dest_id: 10104,
          ammount: 256.0,
          date: new Date(),
        },
        {
          id: 10101,
          description: 'Transfer #2',
          user_id: 10101,
          acc_ori_id: 10102,
          acc_dest_id: 10103,
          ammount: 512.0,
          date: new Date(),
        },
      ])
    )
    .then(() =>
      knex('transactions').insert([
        // Transação positiva | saldo = 2
        {
          description: '2',
          date: new Date(),
          ammount: 2.0,
          type: 'I',
          acc_id: 10104,
          status: true,
        },
        // Transação usuário errado | saldo = 2
        {
          description: '2',
          date: new Date(),
          ammount: 4.0,
          type: 'I',
          acc_id: 10102,
          status: true,
        },
        // Transação outra conta | saldo = 2 / saldo = 8
        {
          description: '2',
          date: new Date(),
          ammount: 8.0,
          type: 'I',
          acc_id: 10105,
          status: true,
        },
        // Transação pendente | saldo = 2 / saldo = 8
        {
          description: '2',
          date: new Date(),
          ammount: 16.0,
          type: 'I',
          acc_id: 10104,
          status: false,
        },
        // Transação passada | saldo = 34 / saldo = 8
        {
          description: '2',
          date: moment().subtract({ days: 5 }),
          ammount: 32.0,
          type: 'I',
          acc_id: 10104,
          status: true,
        },
        // Transação futura | saldo = 34 / saldo = 8
        {
          description: '2',
          date: moment().add({ days: 5 }),
          ammount: 64.0,
          type: 'I',
          acc_id: 10104,
          status: true,
        },
        // Transação negativa | saldo = -94 / saldo = 8
        {
          description: '2',
          date: new Date(),
          ammount: -128.0,
          type: 'O',
          acc_id: 10104,
          status: true,
        },
        // Transferência | saldo = 162 / saldo = -248
        {
          description: '2',
          date: new Date(),
          ammount: 256.0,
          type: 'I',
          acc_id: 10104,
          status: true,
        },
        {
          description: '2',
          date: new Date(),
          ammount: -256.0,
          type: 'O',
          acc_id: 10105,
          status: true,
        },
        // Transferência | saldo = 162 / saldo = -248
        {
          description: '2',
          date: new Date(),
          ammount: 512.0,
          type: 'I',
          acc_id: 10103,
          status: true,
        },
        {
          description: '2',
          date: new Date(),
          ammount: -512.0,
          type: 'O',
          acc_id: 10102,
          status: true,
        },
      ])
    );
