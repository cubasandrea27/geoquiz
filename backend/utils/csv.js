function quitarComillas(valor) {
  return String(valor || '').replace(/^\uFEFF/, '').trim();
}

function normalizarEncabezado(valor) {
  return quitarComillas(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function parseCsv(csv) {
  const texto = String(csv || '').replace(/^\uFEFF/, '');
  const filas = [];
  let fila = [];
  let campo = '';
  let entreComillas = false;

  for (let i = 0; i < texto.length; i += 1) {
    const caracter = texto[i];
    const siguiente = texto[i + 1];

    if (caracter === '"' && entreComillas && siguiente === '"') {
      campo += '"';
      i += 1;
    } else if (caracter === '"') {
      entreComillas = !entreComillas;
    } else if (caracter === ',' && !entreComillas) {
      fila.push(campo);
      campo = '';
    } else if ((caracter === '\n' || caracter === '\r') && !entreComillas) {
      if (caracter === '\r' && siguiente === '\n') i += 1;
      fila.push(campo);
      campo = '';
      if (fila.some((valor) => valor.trim() !== '')) filas.push(fila);
      fila = [];
    } else {
      campo += caracter;
    }
  }

  if (campo.length || fila.length) {
    fila.push(campo);
    if (fila.some((valor) => valor.trim() !== '')) filas.push(fila);
  }

  if (filas.length === 0) return { headers: [], rows: [] };

  const headers = filas[0].map(normalizarEncabezado);
  const rows = filas.slice(1).map(values => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = quitarComillas(values[index]);
    });
    return row;
  });

  return { headers, rows };
}

module.exports = { parseCsv, normalizarEncabezado };
