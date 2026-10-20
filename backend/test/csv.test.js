const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCsv } = require('../utils/csv');

test('parsea CSV con encabezados y campos entre comillas', () => {
  const resultado = parseCsv('nombre,apellido,dni,password\n"Ana, María",García,12345678,secreto123');
  assert.deepEqual(resultado.headers, ['nombre', 'apellido', 'dni', 'password']);
  assert.equal(resultado.rows[0].nombre, 'Ana, María');
  assert.equal(resultado.rows[0].dni, '12345678');
});

test('normaliza encabezado con acentos y espacios', () => {
  const resultado = parseCsv('Nombre,Apellido,DNI,Contraseña\nAna,Pérez,12345678,secreto123');
  assert.deepEqual(resultado.headers, ['nombre', 'apellido', 'dni', 'contrasena']);
  assert.equal(resultado.rows[0].contrasena, 'secreto123');
});
