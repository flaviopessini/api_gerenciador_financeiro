test('Devo conhecer as principais assertivas do jest', () => {
  let number = null;
  // Espera que seja nulo.
  expect(number).toBeNull();

  number = 10;
  // Agora espera que seja diferente de nulo.
  expect(number).not.toBeNull();

  // Espera que seja igual a 10.
  expect(number).toBe(10);
  expect(number).toEqual(10);

  // Espera que seja maior que 9.
  expect(number).toBeGreaterThan(9);

  // Espera que seja menor que 11.
  expect(number).toBeLessThan(11);
});

test('Devo saber trabalhar com objetos', () => {
  const obj = { name: 'Flávio', email: 'abc@gmail.com' };

  // Espera que o objeto possua a propriedade indicada.
  expect(obj).toHaveProperty('name');
  // Espera que o objeto possua a propriedade e o valor indicados.
  expect(obj).toHaveProperty('name', 'Flávio');
  expect(obj.name).toBe('Flávio');

  const obj2 = { name: 'Flávio', email: 'abc@gmail.com' };

  // Compara os 2 objetos.
  // expect(obj2).toBe(obj); //falha
  expect(obj2).toEqual(obj);
});
