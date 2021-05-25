const request = require('supertest');

const app = require('../../src/app');

test('Deve receber token ao logar', async () => {
  const data = {
    name: `John ${Math.floor(Math.random() * 100)}`,
    email: `${Date.now()}@example.com`,
    passwd: '123456',
  };

  await app.services.user.save(data);
  const res = await request(app)
    .post('/auth/signin')
    .send({ email: data.email, passwd: '123456' });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
});

test('Não deve autenticar e-mail inexistente', async () => {
  const data = {
    name: `John ${Math.floor(Math.random() * 100)}`,
    email: `${Date.now()}@example.com`,
    passwd: '123456',
  };

  await app.services.user.save(data);
  const res = await request(app)
    .post('/auth/signin')
    .send({ email: 'email_invalido@example.com', passwd: '123456' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Usuário ou senha inválidos');
});

test('Não deve autenticar usuário com senha errada', async () => {
  const data = {
    name: `John ${Math.floor(Math.random() * 100)}`,
    email: `${Date.now()}@example.com`,
    passwd: '123456',
  };

  await app.services.user.save(data);
  const res = await request(app)
    .post('/auth/signin')
    .send({ email: data.email, passwd: 'senhainvalida' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Usuário ou senha inválidos');
});

test('Não deve acessar uma rota protegida sem token', async () => {
  const res = await request(app).get('/users');

  expect(res.status).toBe(401);
});
