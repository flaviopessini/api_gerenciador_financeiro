const supertest = require('supertest');

const request = supertest('http://localhost:3001');

test('Deve responder na porta 3001', async () => {
  // Acessar url em http://localhost:3001/

  // Em tarefas assíncronas, deve retornar a promisse para o Jest.
  const res = await request.get('/');
  return expect(res.status).toBe(200);
  // Deve retornar resposta HTTP 200

  // return request.get('/').then(res=>expect(res.status).toBe(200));
});
