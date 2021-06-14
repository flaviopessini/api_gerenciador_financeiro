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
    ])
    .then(() =>
      knex('accounts').insert([
        { id: 10100, name: 'Acc Saldo Principal', user_id: 10100 },
        { id: 10101, name: 'Acc Saldo Secundário', user_id: 10100 },
        { id: 10102, name: 'Acc Alternativa 1', user_id: 10101 },
        { id: 10103, name: 'Acc Alternativa 2', user_id: 10101 },
      ])
    );
