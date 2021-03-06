/* eslint-disable function-paren-newline */
exports.seed = (knex) =>
  // Deletes ALL existing entries
  knex('transactions')
    .del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() =>
      knex('users').insert([
        {
          id: 10000,
          name: 'User #1',
          email: 'user_1@example.com',
          passwd:
            '$2a$10$rD7/4wT0dOyClbXSh9tCZuzGPXMk6kxrvC3DNmFW9W.f30jhOHote',
        },
        {
          id: 10001,
          name: 'User #2',
          email: 'user_2@example.com',
          passwd:
            '$2a$10$rD7/4wT0dOyClbXSh9tCZuzGPXMk6kxrvC3DNmFW9W.f30jhOHote',
        },
      ])
    )
    .then(() =>
      knex('accounts').insert([
        { id: 10000, name: 'AccO #1', user_id: 10000 },
        { id: 10001, name: 'AccD #1', user_id: 10000 },
        { id: 10002, name: 'AccO #2', user_id: 10001 },
        { id: 10003, name: 'AccD #2', user_id: 10001 },
      ])
    )
    .then(() =>
      knex('transfers').insert([
        {
          id: 10000,
          description: 'Transfer #1',
          user_id: 10000,
          acc_ori_id: 10000,
          acc_dest_id: 10001,
          ammount: 100.0,
          date: new Date(),
        },
        {
          id: 10001,
          description: 'Transfer #2',
          user_id: 10001,
          acc_ori_id: 10002,
          acc_dest_id: 10003,
          ammount: 100.0,
          date: new Date(),
        },
      ])
    )
    .then(() =>
      knex('transactions').insert([
        {
          description: 'Transfer from AccO #1',
          date: new Date(),
          ammount: 100.0,
          type: 'I',
          acc_id: 10001,
          transfer_id: 10000,
        },
        {
          description: 'Transfer to AccD #1',
          date: new Date(),
          ammount: -100.0,
          type: 'O',
          acc_id: 10000,
          transfer_id: 10000,
        },
        {
          description: 'Transfer from AccO #2',
          date: new Date(),
          ammount: 100.0,
          type: 'O',
          acc_id: 10003,
          transfer_id: 10001,
        },
        {
          description: 'Transfer to AccD #2',
          date: new Date(),
          ammount: -100.0,
          type: 'O',
          acc_id: 10002,
          transfer_id: 10001,
        },
      ])
    );
