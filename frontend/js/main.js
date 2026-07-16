/* ============================================================
   GeoQuiz - Dashboard
   Por ahora todo funciona con datos de ejemplo en memoria.
   Cuando el backend tenga las rutas de temas/preguntas/
   ubicaciones/respuestas, estos arrays se reemplazan por
   fetch() a la API (como ya se hace en login y registro).
============================================================ */

const ICONOS = {
  pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  compass: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5 13 13l-3.5 1.5L11 11l3.5-1.5z"/></svg>',
  layers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 9l10 6 10-6-10-6z"/><path d="M2 15l10 6 10-6"/></svg>',
  question: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2-2.4 3.5"/><path d="M12 17.5h.01"/></svg>',
  map: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
  users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.6"/><path d="M15.8 13.2a5.3 5.3 0 0 1 5.7 5.3"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>'
};

const SECCIONES_DOCENTE = [
  { id: 'temas', label: 'Temas', icono: 'layers' },
  { id: 'preguntas', label: 'Preguntas', icono: 'question' },
  { id: 'ubicaciones', label: 'Ubicaciones', icono: 'map' },
  { id: 'respuestas', label: 'Respuestas', icono: 'users' }
];

const SECCIONES_ALUMNO = [
  { id: 'preguntas-cercanas', label: 'Preguntas cercanas', icono: 'pin' },
  { id: 'mis-respuestas', label: 'Mis respuestas', icono: 'list' },
  { id: 'mis-temas', label: 'Mis temas', icono: 'compass' }
];

/* ---------------- Datos de ejemplo ---------------- */

let temas = [
  { id: 1, nombre: 'Historia Argentina', descripcion: 'Preguntas sobre historia nacional', activo: true },
  { id: 2, nombre: 'Geografía Local', descripcion: 'Puntos de interés del barrio', activo: true }
];

let ubicaciones = [
  { id: 1, temaId: 1, nombre: 'Plaza Central', lat: -34.6037, lng: -58.3816, radio: 50 },
  { id: 2, temaId: 1, nombre: 'Monumento Norte', lat: -34.6010, lng: -58.3850, radio: 30 }
];

let preguntas = [
  { id: 1, temaId: 1, ubicacionId: 1, enunciado: '¿En qué año se declaró la Independencia Argentina?', opciones: ['1810', '1816', '1820'], correcta: 1 },
  { id: 2, temaId: 1, ubicacionId: 2, enunciado: '¿Quién fue el primer presidente de Argentina?', opciones: ['Bernardino Rivadavia', 'Manuel Belgrano', 'José de San Martín'], correcta: 0 }
];

let respuestas = [
  { id: 1, alumno: 'María García', preguntaId: 1, correcta: true, fecha: '10/07 14:22' },
  { id: 2, alumno: 'Carlos López', preguntaId: 2, correcta: false, fecha: '10/07 14:25' }
];

let misRespuestas = [
  { preguntaId: 1, correcta: true, fecha: '09/07 10:03' }
];

/* ---------------- Estado de UI ---------------- */

let seccionActiva = null;
let formTemaAbierto = false;
let formPreguntaAbierto = false;
let formUbicacionAbierto = false;
let filtroRespuestasTema = 'todos';

function wp(n) {
  return 'WP-' + String(n).padStart(2, '0');
}

function nombreTema(id) {
  const t = temas.find((x) => x.id === id);
  return t ? t.nombre : '—';
}

function nombreUbicacion(id) {
  const u = ubicaciones.find((x) => x.id === id);
  return u ? u.nombre : '—';
}

/* ---------------- Arranque ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  if (!rol) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('bienvenida').textContent = nombre ? `Hola, ${nombre}` : 'Hola';

  const secciones = rol === 'docente' ? SECCIONES_DOCENTE : SECCIONES_ALUMNO;
  construirNav(secciones);
  mostrarSeccion(secciones[0].id);

  document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    localStorage.removeItem('dni');
    localStorage.removeItem('email');
    window.location.href = 'index.html';
  });
});

function construirNav(secciones) {
  const sidenav = document.getElementById('sidenav');
  const bottomnav = document.getElementById('bottomnav');

  sidenav.innerHTML = secciones.map((s) => `
    <div class="sidenav-item" data-nav="${s.id}" onclick="mostrarSeccion('${s.id}')">
      ${ICONOS[s.icono]}<span>${s.label}</span>
    </div>
  `).join('');

  bottomnav.innerHTML = secciones.map((s) => `
    <div class="bottomnav-item" data-nav="${s.id}" onclick="mostrarSeccion('${s.id}')">
      ${ICONOS[s.icono]}<span>${s.label}</span>
    </div>
  `).join('');
}

function mostrarSeccion(id) {
  seccionActiva = id;

  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.classList.toggle('activa', el.dataset.nav === id);
  });

  const render = RENDERS[id];
  document.getElementById('contenido').innerHTML = render ? render() : '';
}

/* ============================================================
   DOCENTE - Temas
============================================================ */

function renderTemas() {
  const filas = temas.map((t) => `
    <div class="card-item">
      <div class="card-icono acento">${ICONOS.layers}</div>
      <div class="card-cuerpo">
        <p class="card-wp">${wp(t.id)}</p>
        <p class="card-titulo">${t.nombre}</p>
        <p class="card-detalle">${t.descripcion}</p>
      </div>
      <span class="pill ${t.activo ? 'pill-activo' : 'pill-inactivo'}">${t.activo ? 'Activo' : 'Inactivo'}</span>
    </div>
  `).join('') || '<p class="vacio">Todavía no cargaste ningún tema.</p>';

  return `
    <div class="seccion-header">
      <div>
        <h2>Gestionar temas</h2>
        <p class="seccion-sub">Los temas agrupan las preguntas que vas a repartir por el mapa.</p>
      </div>
      <button class="btn-accion" onclick="toggleFormTema()">${ICONOS.plus}Nuevo tema</button>
    </div>
    ${formTemaAbierto ? `
      <div class="form-inline">
        <div>
          <label for="ft-nombre">Nombre</label>
          <input id="ft-nombre" placeholder="Ej: Historia Argentina">
        </div>
        <div>
          <label for="ft-desc">Descripción</label>
          <input id="ft-desc" placeholder="Ej: Preguntas sobre historia nacional">
        </div>
        <button class="btn-primario" onclick="crearTema()">${ICONOS.check} Guardar tema</button>
      </div>
    ` : ''}
    <div class="grid-cards">${filas}</div>
  `;
}

function toggleFormTema() {
  formTemaAbierto = !formTemaAbierto;
  mostrarSeccion('temas');
}

function crearTema() {
  const nombre = document.getElementById('ft-nombre').value.trim();
  const desc = document.getElementById('ft-desc').value.trim();
  if (!nombre) {
    alert('Ingresá un nombre para el tema.');
    return;
  }
  const nuevoId = temas.length ? Math.max(...temas.map((t) => t.id)) + 1 : 1;
  temas.push({ id: nuevoId, nombre, descripcion: desc || 'Sin descripción', activo: true });
  formTemaAbierto = false;
  mostrarSeccion('temas');
}

/* ============================================================
   DOCENTE - Preguntas
============================================================ */

function renderPreguntas() {
  const filas = preguntas.map((p) => `
    <div class="card-item">
      <div class="card-icono acento">${ICONOS.question}</div>
      <div class="card-cuerpo">
        <p class="card-wp">${wp(p.id)} · ${nombreTema(p.temaId)}</p>
        <p class="card-titulo">${p.enunciado}</p>
        <p class="card-detalle">${p.opciones.length} opciones · ubicación: ${nombreUbicacion(p.ubicacionId)}</p>
      </div>
    </div>
  `).join('') || '<p class="vacio">Todavía no cargaste ninguna pregunta.</p>';

  const opcionesTemas = temas.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('');
  const opcionesUbic = ubicaciones.map((u) => `<option value="${u.id}">${u.nombre}</option>`).join('');

  return `
    <div class="seccion-header">
      <div>
        <h2>Gestionar preguntas</h2>
        <p class="seccion-sub">Cada pregunta se ata a un tema y, opcionalmente, a una ubicación puntual.</p>
      </div>
      <button class="btn-accion" onclick="toggleFormPregunta()">${ICONOS.plus}Nueva pregunta</button>
    </div>
    ${formPreguntaAbierto ? `
      <div class="form-inline">
        <div>
          <label for="fp-enunciado">Enunciado</label>
          <input id="fp-enunciado" placeholder="Ej: ¿En qué año...?">
        </div>
        <div class="form-fila">
          <div>
            <label for="fp-tema">Tema</label>
            <select id="fp-tema">${opcionesTemas}</select>
          </div>
          <div>
            <label for="fp-ubic">Ubicación</label>
            <select id="fp-ubic">${opcionesUbic}</select>
          </div>
        </div>
        <button class="btn-primario" onclick="crearPregunta()">${ICONOS.check} Guardar pregunta</button>
      </div>
    ` : ''}
    <div class="grid-cards">${filas}</div>
  `;
}

function toggleFormPregunta() {
  formPreguntaAbierto = !formPreguntaAbierto;
  mostrarSeccion('preguntas');
}

function crearPregunta() {
  const enunciado = document.getElementById('fp-enunciado').value.trim();
  const temaId = Number(document.getElementById('fp-tema').value);
  const ubicacionId = Number(document.getElementById('fp-ubic').value);
  if (!enunciado || !temaId) {
    alert('Completá el enunciado y elegí un tema.');
    return;
  }
  const nuevoId = preguntas.length ? Math.max(...preguntas.map((p) => p.id)) + 1 : 1;
  preguntas.push({ id: nuevoId, temaId, ubicacionId, enunciado, opciones: ['Opción 1', 'Opción 2'], correcta: 0 });
  formPreguntaAbierto = false;
  mostrarSeccion('preguntas');
}

/* ============================================================
   DOCENTE - Ubicaciones
============================================================ */

function renderUbicaciones() {
  const filas = ubicaciones.map((u) => `
    <div class="card-item">
      <div class="card-icono acento">${ICONOS.map}</div>
      <div class="card-cuerpo">
        <p class="card-wp">${wp(u.id)} · ${nombreTema(u.temaId)}</p>
        <p class="card-titulo">${u.nombre}</p>
        <p class="card-coord">${u.lat.toFixed(4)}, ${u.lng.toFixed(4)} · radio ${u.radio} m</p>
      </div>
    </div>
  `).join('') || '<p class="vacio">Todavía no cargaste ninguna ubicación.</p>';

  const opcionesTemas = temas.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('');

  return `
    <div class="seccion-header">
      <div>
        <h2>Gestionar ubicaciones</h2>
        <p class="seccion-sub">Coordenadas GPS y radio de detección para cada punto del mapa.</p>
      </div>
      <button class="btn-accion" onclick="toggleFormUbicacion()">${ICONOS.plus}Nueva ubicación</button>
    </div>
    ${formUbicacionAbierto ? `
      <div class="form-inline">
        <div>
          <label for="fu-nombre">Nombre</label>
          <input id="fu-nombre" placeholder="Ej: Plaza Central">
        </div>
        <div class="form-fila">
          <div>
            <label for="fu-lat">Latitud</label>
            <input id="fu-lat" placeholder="-34.6037">
          </div>
          <div>
            <label for="fu-lng">Longitud</label>
            <input id="fu-lng" placeholder="-58.3816">
          </div>
        </div>
        <div class="form-fila">
          <div>
            <label for="fu-radio">Radio (metros)</label>
            <input id="fu-radio" placeholder="50">
          </div>
          <div>
            <label for="fu-tema">Tema</label>
            <select id="fu-tema">${opcionesTemas}</select>
          </div>
        </div>
        <button class="btn-primario" onclick="crearUbicacion()">${ICONOS.check} Guardar ubicación</button>
      </div>
    ` : ''}
    <div class="grid-cards">${filas}</div>
  `;
}

function toggleFormUbicacion() {
  formUbicacionAbierto = !formUbicacionAbierto;
  mostrarSeccion('ubicaciones');
}

function crearUbicacion() {
  const nombre = document.getElementById('fu-nombre').value.trim();
  const lat = parseFloat(document.getElementById('fu-lat').value);
  const lng = parseFloat(document.getElementById('fu-lng').value);
  const radio = parseInt(document.getElementById('fu-radio').value, 10);
  const temaId = Number(document.getElementById('fu-tema').value);
  if (!nombre || isNaN(lat) || isNaN(lng) || !temaId) {
    alert('Completá nombre, latitud, longitud y tema.');
    return;
  }
  const nuevoId = ubicaciones.length ? Math.max(...ubicaciones.map((u) => u.id)) + 1 : 1;
  ubicaciones.push({ id: nuevoId, temaId, nombre, lat, lng, radio: isNaN(radio) ? 50 : radio });
  formUbicacionAbierto = false;
  mostrarSeccion('ubicaciones');
}

/* ============================================================
   DOCENTE - Ver respuestas
============================================================ */

function renderRespuestas() {
  const listaFiltrada = filtroRespuestasTema === 'todos'
    ? respuestas
    : respuestas.filter((r) => {
        const p = preguntas.find((x) => x.id === r.preguntaId);
        return p && p.temaId === Number(filtroRespuestasTema);
      });

  const filas = listaFiltrada.map((r) => {
    const p = preguntas.find((x) => x.id === r.preguntaId);
    return `
      <tr>
        <td>${r.alumno}</td>
        <td>${p ? p.enunciado : '—'}</td>
        <td><span class="pill ${r.correcta ? 'pill-correcta' : 'pill-incorrecta'}">${r.correcta ? 'Correcta' : 'Incorrecta'}</span></td>
        <td class="card-coord">${r.fecha}</td>
      </tr>
    `;
  }).join('');

  const opcionesTemas = temas.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('');

  return `
    <div class="seccion-header">
      <div>
        <h2>Ver respuestas</h2>
        <p class="seccion-sub">Historial de respuestas de los alumnos inscriptos.</p>
      </div>
    </div>
    <div class="form-inline filtro-tabla">
      <div>
        <label for="filtro-tema">Filtrar por tema</label>
        <select id="filtro-tema" onchange="filtrarRespuestas(this.value)">
          <option value="todos" ${filtroRespuestasTema === 'todos' ? 'selected' : ''}>Todos los temas</option>
          ${opcionesTemas}
        </select>
      </div>
    </div>
    ${filas ? `
      <table class="tabla-resp">
        <thead>
          <tr><th>Alumno</th><th>Pregunta</th><th>Resultado</th><th>Fecha</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    ` : '<p class="vacio">No hay respuestas para ese tema todavía.</p>'}
  `;
}

function filtrarRespuestas(valor) {
  filtroRespuestasTema = valor;
  mostrarSeccion('respuestas');
}

/* ============================================================
   ALUMNO - Preguntas cercanas
============================================================ */

function renderPreguntasCercanas() {
  const yaRespondidas = misRespuestas.map((r) => r.preguntaId);
  const disponibles = preguntas.filter((p) => !yaRespondidas.includes(p.id));

  if (!disponibles.length) {
    return `
      <div class="seccion-header">
        <div>
          <h2>Preguntas cercanas</h2>
          <p class="seccion-sub">Estas son las preguntas de los puntos donde estás parado ahora.</p>
        </div>
      </div>
      <p class="vacio">Ya respondiste todas las preguntas cercanas por ahora. Volvé a pasar por acá más tarde.</p>
    `;
  }

  const tarjetas = disponibles.map((p) => `
    <div class="pregunta-card" id="pregunta-${p.id}">
      <p class="card-wp">${wp(p.id)} · ${nombreUbicacion(p.ubicacionId)} · dentro del radio</p>
      <p class="pregunta-enunciado">${p.enunciado}</p>
      ${p.opciones.map((op, i) => `
        <button class="opcion" onclick="responderPregunta(${p.id}, ${i})">${op}</button>
      `).join('')}
    </div>
  `).join('');

  return `
    <div class="seccion-header">
      <div>
        <h2>Preguntas cercanas</h2>
        <p class="seccion-sub">Estas son las preguntas de los puntos donde estás parado ahora.</p>
      </div>
    </div>
    ${tarjetas}
  `;
}

function responderPregunta(preguntaId, opcionIndex) {
  const p = preguntas.find((x) => x.id === preguntaId);
  if (!p) return;

  const esCorrecta = opcionIndex === p.correcta;
  const botones = document.querySelectorAll(`#pregunta-${preguntaId} .opcion`);
  botones.forEach((btn, i) => {
    btn.disabled = true;
    if (i === opcionIndex) btn.classList.add(esCorrecta ? 'correcta' : 'incorrecta');
    if (i === p.correcta && !esCorrecta) btn.classList.add('correcta');
  });

  const ahora = new Date();
  const fecha = `${String(ahora.getDate()).padStart(2, '0')}/${String(ahora.getMonth() + 1).padStart(2, '0')} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  misRespuestas.push({ preguntaId, correcta: esCorrecta, fecha });

  setTimeout(() => mostrarSeccion('preguntas-cercanas'), 900);
}

/* ============================================================
   ALUMNO - Mis respuestas
============================================================ */

function renderMisRespuestas() {
  const filas = misRespuestas.map((r) => {
    const p = preguntas.find((x) => x.id === r.preguntaId);
    return `
      <div class="card-item">
        <div class="card-icono ${r.correcta ? 'exito' : ''}">${r.correcta ? ICONOS.check : ICONOS.question}</div>
        <div class="card-cuerpo">
          <p class="card-titulo">${p ? p.enunciado : '—'}</p>
          <p class="card-coord">${r.fecha}</p>
        </div>
        <span class="pill ${r.correcta ? 'pill-correcta' : 'pill-incorrecta'}">${r.correcta ? 'Correcta' : 'Incorrecta'}</span>
      </div>
    `;
  }).join('') || '<p class="vacio">Todavía no respondiste ninguna pregunta.</p>';

  return `
    <div class="seccion-header">
      <div>
        <h2>Mis respuestas</h2>
        <p class="seccion-sub">Historial de las preguntas que fuiste respondiendo.</p>
      </div>
    </div>
    <div class="grid-cards">${filas}</div>
  `;
}

/* ============================================================
   ALUMNO - Mis temas
============================================================ */

function renderMisTemas() {
  const filas = temas.map((t) => {
    const totalPreguntas = preguntas.filter((p) => p.temaId === t.id).length;
    const respondidas = preguntas.filter((p) => p.temaId === t.id && misRespuestas.some((r) => r.preguntaId === p.id)).length;
    const porcentaje = totalPreguntas ? Math.round((respondidas / totalPreguntas) * 100) : 0;

    return `
      <div class="card-item" style="flex-direction: column; align-items: stretch;">
        <div style="display:flex; align-items:flex-start; gap:12px;">
          <div class="card-icono acento">${ICONOS.compass}</div>
          <div class="card-cuerpo">
            <p class="card-wp">${wp(t.id)}</p>
            <p class="card-titulo">${t.nombre}</p>
            <p class="card-detalle">${respondidas} de ${totalPreguntas} preguntas respondidas</p>
          </div>
        </div>
        <div class="progreso"><div class="progreso-barra" style="width:${porcentaje}%;"></div></div>
      </div>
    `;
  }).join('') || '<p class="vacio">Todavía no estás inscripto en ningún tema.</p>';

  return `
    <div class="seccion-header">
      <div>
        <h2>Mis temas</h2>
        <p class="seccion-sub">Progreso dentro de cada tema en el que estás inscripto.</p>
      </div>
    </div>
    <div class="grid-cards">${filas}</div>
  `;
}

/* ---------------- Router de secciones ---------------- */

const RENDERS = {
  'temas': renderTemas,
  'preguntas': renderPreguntas,
  'ubicaciones': renderUbicaciones,
  'respuestas': renderRespuestas,
  'preguntas-cercanas': renderPreguntasCercanas,
  'mis-respuestas': renderMisRespuestas,
  'mis-temas': renderMisTemas
};
