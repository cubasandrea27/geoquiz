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
  { id: 'materias-disponibles', label: 'Materias disponibles', icono: 'layers' },
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
let preguntaEnEdicion = null;
let temaEnEdicion = null;

// Temas reales del docente logueado, traídos de la API (reemplaza al
// array de ejemplo "temas" en las secciones de docente: Preguntas y
// Respuestas necesitan mostrar siempre los temas reales, no los de demo).
let temasDocenteCache = [];

async function cargarTemasDocenteCache() {
  const docenteId = localStorage.getItem('userId');
  if (!docenteId) {
    temasDocenteCache = [];
    return temasDocenteCache;
  }
  try {
    const res = await fetch(`http://localhost:3000/api/temas/docente/${docenteId}`);
    const data = await res.json();
    temasDocenteCache = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al cargar temas del docente:', error);
    temasDocenteCache = [];
  }
  return temasDocenteCache;
}

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
  const resultado = render ? render() : '';

  if (resultado instanceof Promise) {
    resultado.then(html => {
      document.getElementById('contenido').innerHTML = html;
    });
  } else {
    document.getElementById('contenido').innerHTML = resultado;
  }
}

/* ============================================================
   DOCENTE - Temas
============================================================ */

async function renderTemas() {
  try {
    await cargarTemasDocenteCache();
    const temasAPI = temasDocenteCache;

    const filas = temasAPI.map((t) => `
      <div class="card-item">
        <div class="card-icono acento">${ICONOS.layers}</div>
        <div class="card-cuerpo">
          <p class="card-wp">${wp(t.id)}</p>
          <p class="card-titulo">${t.nombre}</p>
          <p class="card-detalle">${t.descripcion || 'Sin descripción'}</p>
        </div>
        <span class="pill pill-activo">Activo</span>
        <div style="display: flex; gap: 8px;">
          <button class="btn-small" onclick="editarTema(${t.id})">Editar</button>
          <button class="btn-small btn-danger" onclick="eliminarTema(${t.id})">Eliminar</button>
        </div>
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
          ${temaEnEdicion ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: var(--acento);">✏️ Editando tema #${temaEnEdicion.id}</p>` : ''}
          <div>
            <label for="ft-nombre">Nombre *</label>
            <input id="ft-nombre" placeholder="Ej: Historia Argentina">
          </div>
          <div>
            <label for="ft-desc">Descripción</label>
            <input id="ft-desc" placeholder="Ej: Preguntas sobre historia nacional">
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primario" onclick="crearTema()">${ICONOS.check} ${temaEnEdicion ? 'Guardar cambios' : 'Guardar tema'}</button>
            <button class="btn-primario" style="background: var(--superficie-2); color: var(--texto);" onclick="temaEnEdicion ? cancelarEdicionTema() : toggleFormTema()">Cancelar</button>
          </div>
        </div>
      ` : ''}
      <div class="grid-cards">${filas}</div>
    `;
  } catch (error) {
    console.error('Error al cargar temas:', error);
    return `
      <div class="seccion-header">
        <div>
          <h2>Gestionar temas</h2>
        </div>
      </div>
      <p class="vacio">Error al cargar los temas.</p>
    `;
  }
}

function toggleFormTema() {
  formTemaAbierto = !formTemaAbierto;
  if (!formTemaAbierto) temaEnEdicion = null;
  mostrarSeccion('temas');
}

async function crearTema() {
  const nombre = document.getElementById('ft-nombre').value.trim();
  const desc = document.getElementById('ft-desc').value.trim();
  const docenteId = localStorage.getItem('userId');

  if (!nombre) {
    alert('Ingresá un nombre para el tema.');
    return;
  }

  try {
    if (temaEnEdicion) {
      const res = await fetch(`http://localhost:3000/api/temas/${temaEnEdicion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion: desc })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'No se pudo actualizar el tema.');
        return;
      }

      alert('Tema actualizado correctamente.');
      temaEnEdicion = null;
      formTemaAbierto = false;
      mostrarSeccion('temas');
      return;
    }

    const res = await fetch('http://localhost:3000/api/temas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        descripcion: desc,
        docenteId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'No se pudo crear el tema.');
      return;
    }

    if (data.existente) {
      alert('Este tema ya existe.');
    } else {
      alert('Tema creado correctamente.');
    }

    formTemaAbierto = false;
    mostrarSeccion('temas');
  } catch (error) {
    console.error('Error al crear/editar tema:', error);
    alert('Error al conectar con el servidor.');
  }
}

function editarTema(temaId) {
  const tema = temasDocenteCache.find((t) => t.id === temaId);
  if (!tema) {
    alert('No se pudo cargar el tema.');
    return;
  }

  temaEnEdicion = tema;
  formTemaAbierto = true;
  mostrarSeccion('temas');

  setTimeout(() => {
    document.getElementById('ft-nombre').value = tema.nombre;
    document.getElementById('ft-desc').value = tema.descripcion || '';
    document.querySelector('.form-inline').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function cancelarEdicionTema() {
  temaEnEdicion = null;
  formTemaAbierto = false;
  mostrarSeccion('temas');
}

async function eliminarTema(temaId) {
  if (!confirm('¿Estás seguro de que querés eliminar este tema? También se ocultarán sus preguntas.')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/temas/${temaId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'No se pudo eliminar el tema.');
      return;
    }

    alert('Tema eliminado.');
    mostrarSeccion('temas');
  } catch (error) {
    console.error('Error al eliminar tema:', error);
    alert('Error al conectar con el servidor.');
  }
}

async function renderPreguntas() {
  try {
    await cargarTemasDocenteCache();

    const res = await fetch('http://localhost:3000/api/preguntas/todas');
    let preguntasAPI = await res.json();

    if (!Array.isArray(preguntasAPI)) {
      preguntasAPI = [];
    }

    // Sólo mostrar preguntas de temas que le pertenecen al docente logueado.
    const idsTemasDocente = temasDocenteCache.map((t) => t.id);
    preguntasAPI = preguntasAPI.filter((p) => idsTemasDocente.includes(p.temaId));

    // Obtener tema seleccionado del filtro si existe
    const filtroTemaSelect = document.getElementById('filtro-tema-preguntas');
    const temaFiltro = filtroTemaSelect ? filtroTemaSelect.value : '';
    
    // Filtrar preguntas por tema si hay selección
    const preguntasFiltradas = temaFiltro 
      ? preguntasAPI.filter(p => String(p.temaId) === String(temaFiltro))
      : preguntasAPI;

    const filas = preguntasFiltradas.map((p) => `
      <div class="card-item" style="flex-direction: column; align-items: stretch;">
        <div style="display:flex; align-items:flex-start; gap:12px;">
          <div class="card-icono acento">${ICONOS.question}</div>
          <div class="card-cuerpo">
            <p style="font-size: 11px; color: var(--texto-tenue); margin: 0 0 6px 0;">Tema: ${p.temaNombre || 'Sin tema'}</p>
            <p class="card-titulo">${p.enunciado}</p>
            <div style="margin-top: 10px; font-size: 12px; color: var(--texto-tenue);">
              <p>${p.opcion1 ? '✓ ' + p.opcion1 : ''}</p>
              <p>${p.opcion2 ? '✓ ' + p.opcion2 : ''}</p>
              <p>${p.opcion3 ? '✓ ' + p.opcion3 : ''}</p>
              <p style="color: var(--exito); margin-top: 6px;">Correcta: Opción ${p.correcta}</p>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn-small" onclick="editarPregunta(${p.id})">Editar</button>
          <button class="btn-small btn-danger" onclick="eliminarPregunta(${p.id})">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p class="vacio">Todavía no hay preguntas' + (temaFiltro ? ' para este tema.' : '.') + '</p>';

    const opcionesTemas = temasDocenteCache.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('')
      || '<option value="" disabled>Todavía no creaste ningún tema</option>';

    return `
      <div class="seccion-header">
        <div>
          <h2>Gestionar preguntas</h2>
          <p class="seccion-sub">Cada pregunta tiene 3 opciones de respuesta. Marcá cuál es la correcta.</p>
        </div>
        <button class="btn-accion" onclick="toggleFormPregunta()">${ICONOS.plus}Nueva pregunta</button>
      </div>
      
      <div class="form-inline" style="margin-bottom: 16px;">
        <div>
          <label for="filtro-tema-preguntas">Filtrar por tema</label>
          <select id="filtro-tema-preguntas" onchange="mostrarSeccion('preguntas')">
            <option value="">Todos los temas</option>
            ${opcionesTemas}
          </select>
        </div>
      </div>

      ${formPreguntaAbierto ? `
        <div class="form-inline">
          ${preguntaEnEdicion ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: var(--acento);">✏️ Editando pregunta #${preguntaEnEdicion.id}</p>` : ''}
          <div>
            <label for="fp-tema">Tema *</label>
            <select id="fp-tema">${opcionesTemas}</select>
          </div>
          <div>
            <label for="fp-enunciado">Enunciado de la pregunta *</label>
            <textarea id="fp-enunciado" placeholder="Ej: ¿En qué año se declaró la Independencia Argentina?" style="height: 60px;"></textarea>
          </div>
          <fieldset style="border: 1px solid var(--borde); border-radius: 6px; padding: 12px; margin-bottom: 10px;">
            <legend style="padding: 0 8px;">Opciones de respuesta</legend>
            <div style="display: grid; gap: 10px;">
              <div>
                <label for="fp-opcion1">Opción 1 *</label>
                <input id="fp-opcion1" placeholder="Primera opción" />
              </div>
              <div>
                <label for="fp-opcion2">Opción 2 *</label>
                <input id="fp-opcion2" placeholder="Segunda opción" />
              </div>
              <div>
                <label for="fp-opcion3">Opción 3 *</label>
                <input id="fp-opcion3" placeholder="Tercera opción" />
              </div>
              <div style="padding: 10px; background: var(--superficie-2); border-radius: 6px;">
                <label style="font-size: 12px;">¿Cuál es la respuesta correcta? *</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px;">
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="fp-correcta" value="1" checked />
                    <span style="font-size: 12px;">Opción 1</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="fp-correcta" value="2" />
                    <span style="font-size: 12px;">Opción 2</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="fp-correcta" value="3" />
                    <span style="font-size: 12px;">Opción 3</span>
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primario" onclick="crearPregunta()">${ICONOS.check} ${preguntaEnEdicion ? 'Guardar cambios' : 'Guardar pregunta'}</button>
            <button class="btn-primario" style="background: var(--superficie-2); color: var(--texto);" onclick="preguntaEnEdicion ? cancelarEdicion() : toggleFormPregunta()">Cancelar</button>
          </div>
        </div>
      ` : ''}
      <div class="grid-cards">${filas}</div>
    `;
  } catch (error) {
    console.error('Error al cargar preguntas:', error);
    return `
      <div class="seccion-header">
        <div>
          <h2>Gestionar preguntas</h2>
        </div>
      </div>
      <p class="vacio">Error al cargar las preguntas.</p>
    `;
  }
}

function toggleFormPregunta() {
  formPreguntaAbierto = !formPreguntaAbierto;
  mostrarSeccion('preguntas');
}

async function crearPregunta() {
  // Si estamos editando, llamar a guardarEdicionPregunta
  if (preguntaEnEdicion) {
    guardarEdicionPregunta();
    return;
  }

  const temaId = Number(document.getElementById('fp-tema').value);
  const enunciado = document.getElementById('fp-enunciado').value.trim();
  const opcion1 = document.getElementById('fp-opcion1').value.trim();
  const opcion2 = document.getElementById('fp-opcion2').value.trim();
  const opcion3 = document.getElementById('fp-opcion3').value.trim();
  const respuestaCorrecta = document.querySelector('input[name="fp-correcta"]:checked').value;

  if (!temaId || !enunciado || !opcion1 || !opcion2 || !opcion3) {
    alert('Completá el enunciado y todas las 3 opciones.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/preguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temaId,
        enunciado,
        opciones: [opcion1, opcion2, opcion3],
        respuestaCorrecta
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'No se pudo guardar la pregunta.');
      return;
    }

    alert('Pregunta guardada correctamente.');
    formPreguntaAbierto = false;
    mostrarSeccion('preguntas');
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    alert('Error al conectar con el servidor.');
  }
}

async function editarPregunta(preguntaId) {
  // Obtener datos de la pregunta
  const res = await fetch('http://localhost:3000/api/preguntas/todas');
  const preguntasAPI = await res.json();
  const pregunta = preguntasAPI.find(p => p.id === preguntaId);

  if (!pregunta) {
    alert('No se pudo cargar la pregunta.');
    return;
  }

  // Cargar datos en el formulario
  preguntaEnEdicion = pregunta;
  
  // Abrir formulario
  formPreguntaAbierto = true;
  
  // Mostrar sección y luego rellenar campos
  mostrarSeccion('preguntas');
  
  // Esperar a que el DOM se renderice
  setTimeout(() => {
    document.getElementById('fp-tema').value = pregunta.temaId;
    document.getElementById('fp-enunciado').value = pregunta.enunciado;
    document.getElementById('fp-opcion1').value = pregunta.opcion1;
    document.getElementById('fp-opcion2').value = pregunta.opcion2;
    document.getElementById('fp-opcion3').value = pregunta.opcion3;
    
    // Marcar respuesta correcta
    document.querySelector(`input[name="fp-correcta"][value="${pregunta.correcta}"]`).checked = true;
    
    // Scroll al formulario
    document.querySelector('.form-inline').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

async function guardarEdicionPregunta() {
  const enunciado = document.getElementById('fp-enunciado').value.trim();
  const opcion1 = document.getElementById('fp-opcion1').value.trim();
  const opcion2 = document.getElementById('fp-opcion2').value.trim();
  const opcion3 = document.getElementById('fp-opcion3').value.trim();

  if (!enunciado || !opcion1 || !opcion2 || !opcion3) {
    alert('Completá el enunciado y todas las 3 opciones.');
    return;
  }

  try {
    // Actualizar enunciado
    const resEnunciado = await fetch(`http://localhost:3000/api/preguntas/${preguntaEnEdicion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enunciado })
    });

    if (!resEnunciado.ok) {
      alert('No se pudo actualizar el enunciado.');
      return;
    }

    // Actualizar opciones
    for (let i = 0; i < 3; i++) {
      const opcion = [opcion1, opcion2, opcion3][i];
      const esCorrecta = String(i + 1) === document.querySelector('input[name="fp-correcta"]:checked').value;
      const opcionId = preguntaEnEdicion.opciones[i]?.id;

      if (opcionId) {
        const resOpcion = await fetch(`http://localhost:3000/api/preguntas/${preguntaEnEdicion.id}/opciones/${opcionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: opcion, esCorrecta })
        });

        if (!resOpcion.ok) {
          alert('No se pudieron actualizar todas las opciones.');
          return;
        }
      }
    }

    alert('Pregunta actualizada correctamente.');
    preguntaEnEdicion = null;
    formPreguntaAbierto = false;
    mostrarSeccion('preguntas');
  } catch (error) {
    console.error('Error al guardar edición:', error);
    alert('Error al conectar con el servidor.');
  }
}

async function cancelarEdicion() {
  preguntaEnEdicion = null;
  formPreguntaAbierto = false;
  mostrarSeccion('preguntas');
}

async function eliminarPregunta(preguntaId) {
  if (!confirm('¿Estás seguro de que querés eliminar esta pregunta?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/preguntas/${preguntaId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      alert('No se pudo eliminar la pregunta.');
      return;
    }

    alert('Pregunta eliminada.');
    mostrarSeccion('preguntas');
  } catch (error) {
    console.error('Error al eliminar pregunta:', error);
    alert('Error al conectar con el servidor.');
  }
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

async function renderRespuestas() {
  try {
    await cargarTemasDocenteCache();
    const docenteId = localStorage.getItem('userId');

    const res = await fetch(`http://localhost:3000/api/respuestas/docente/${docenteId}`);
    const respuestasAPI = await res.json();

    if (!Array.isArray(respuestasAPI)) {
      return `
        <div class="seccion-header">
          <div>
            <h2>Ver respuestas</h2>
          </div>
        </div>
        <p class="vacio">Error al cargar las respuestas.</p>
      `;
    }

    // Filtrar del lado del cliente por el tema elegido, y recalcular el
    // puntaje de cada alumno en base a las respuestas visibles.
    const alumnosFiltrados = respuestasAPI
      .map((alumno) => {
        const respuestasFiltradas = filtroRespuestasTema === 'todos'
          ? alumno.respuestas
          : alumno.respuestas.filter((r) => String(r.tema_id) === String(filtroRespuestasTema));

        const puntaje = respuestasFiltradas.filter((r) => r.resultado === 'correcta').length;

        return { ...alumno, respuestas: respuestasFiltradas, puntaje };
      })
      .filter((alumno) => alumno.respuestas.length > 0);

    const filas = alumnosFiltrados.map((alumno) => `
      <div class="card-item" style="flex-direction: column; align-items: stretch;">
        <div>
          <p class="card-titulo">${alumno.nombre} ${alumno.apellido}</p>
          <p class="card-detalle">Puntaje: ${alumno.puntaje} de ${alumno.respuestas.length}</p>
        </div>
        <div style="border-top: 1px solid var(--borde); padding-top: 12px; margin-top: 12px;">
          ${alumno.respuestas.map((resp, idx) => `
            <div style="margin-bottom: 12px; padding-bottom: 12px; ${idx < alumno.respuestas.length - 1 ? 'border-bottom: 1px dashed var(--borde);' : ''}">
              <p style="font-size: 12px; color: var(--texto-tenue); margin: 0 0 4px 0;">${resp.tema_nombre || 'Sin tema'}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${resp.pregunta}</p>
              <p style="margin: 0; font-size: 12px;">
                <strong>Respuesta:</strong> ${resp.opcion_elegida}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 12px;">
                <strong>Resultado:</strong> 
                <span class="pill ${resp.resultado === 'correcta' ? 'pill-correcta' : 'pill-incorrecta'}" style="font-size: 10px;">
                  ${resp.resultado === 'correcta' ? '✓ Correcta' : '✗ Incorrecta'}
                </span>
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('') || '<p class="vacio">Todavía no hay alumnos que hayan respondido' + (filtroRespuestasTema !== 'todos' ? ' para este tema.' : '.') + '</p>';

    const opcionesTemas = temasDocenteCache.map((t) => `<option value="${t.id}" ${filtroRespuestasTema === String(t.id) ? 'selected' : ''}>${t.nombre}</option>`).join('');

    return `
      <div class="seccion-header">
        <div>
          <h2>Ver respuestas</h2>
          <p class="seccion-sub">Detalle de qué respondió cada alumno.</p>
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
      <div class="grid-cards">${filas}</div>
    `;
  } catch (error) {
    console.error('Error al cargar respuestas:', error);
    return `
      <div class="seccion-header">
        <div>
          <h2>Ver respuestas</h2>
        </div>
      </div>
      <p class="vacio">Error al cargar las respuestas.</p>
    `;
  }
}

function filtrarRespuestas(valor) {
  filtroRespuestasTema = valor;
  mostrarSeccion('respuestas');
}


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

async function renderMisTemas() {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    return `
      <div class="seccion-header">
        <div>
          <h2>Mis temas</h2>
          <p class="seccion-sub">Progreso dentro de cada tema en el que estás inscripto.</p>
        </div>
      </div>
      <p class="vacio">No se pudo cargar tu información.</p>
    `;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/tema-alumno/alumno/${userId}`);
    const temasInscritos = await res.json();

    if (!temasInscritos.length) {
      return `
        <div class="seccion-header">
          <div>
            <h2>Mis temas</h2>
            <p class="seccion-sub">Progreso dentro de cada tema en el que estás inscripto.</p>
          </div>
        </div>
        <p class="vacio">Todavía no estás inscripto en ningún tema. Ve a "Materias disponibles" para inscribirte.</p>
      `;
    }

    const filas = temasInscritos.map((t) => {
      // Por ahora, sin preguntas respondidas (se puede mejorar después)
      const totalPreguntas = 0;
      const respondidas = 0;
      const porcentaje = 0;

      return `
        <div class="card-item" style="flex-direction: column; align-items: stretch;">
          <div style="display:flex; align-items:flex-start; gap:12px;">
            <div class="card-icono acento">${ICONOS.compass}</div>
            <div class="card-cuerpo">
              <p class="card-titulo">${t.nombre}</p>
              <p class="card-detalle">${t.descripcion || 'Sin descripción'}</p>
            </div>
          </div>
          <button class="btn-secundario" onclick="mostrarSeccion('preguntas-cercanas')" style="margin-top: 12px;">
            Ver preguntas
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="seccion-header">
        <div>
          <h2>Mis temas</h2>
          <p class="seccion-sub">Temas en los que estás inscripto.</p>
        </div>
      </div>
      <div class="grid-cards">${filas}</div>
    `;
  } catch (err) {
    console.error('Error al cargar mis temas:', err);
    return `
      <div class="seccion-header">
        <div>
          <h2>Mis temas</h2>
        </div>
      </div>
      <p class="vacio">Error al cargar tus temas.</p>
    `;
  }
}

/* ============================================================
   ALUMNO - Materias disponibles (por carrera)
============================================================ */

async function renderMateriasDisponibles() {
  const carreraId = localStorage.getItem('carreraId');
  const userId = localStorage.getItem('userId');

  if (!carreraId) {
    return `
      <div class="seccion-header">
        <div>
          <h2>Materias disponibles</h2>
          <p class="seccion-sub">No tienes asignada una carrera aún.</p>
        </div>
      </div>
      <p class="vacio">Contactá con administración para que te asignen una carrera.</p>
    `;
  }

  try {
    // Obtener temas disponibles para la carrera
    const resCarrera = await fetch(`http://localhost:3000/api/carreras/${carreraId}/temas`);
    const temasCarrera = await resCarrera.json();

    // Obtener temas en los que ya estoy inscrito
    const resInscripciones = await fetch(`http://localhost:3000/api/tema-alumno/alumno/${userId}`);
    const temasInscritos = await resInscripciones.json();
    const idsTemasInscritos = temasInscritos.map(t => t.id);

    if (!temasCarrera.length) {
      return `
        <div class="seccion-header">
          <div>
            <h2>Materias disponibles</h2>
            <p class="seccion-sub">Materias de tu carrera disponibles para inscribirse.</p>
          </div>
        </div>
        <p class="vacio">No hay materias disponibles para tu carrera aún.</p>
      `;
    }

    const filas = temasCarrera.map((t) => {
      const yaInscrito = idsTemasInscritos.includes(t.id);
      const btnClass = yaInscrito ? 'btn-inscrito' : 'btn-inscribirse';
      const btnTexto = yaInscrito ? 'Inscripto ✓' : 'Inscribirse';
      const btnDisabled = yaInscrito ? 'disabled' : '';

      return `
        <div class="card-item" style="flex-direction: column; align-items: stretch;">
          <div style="display:flex; align-items:flex-start; gap:12px;">
            <div class="card-icono acento">${ICONOS.layers}</div>
            <div class="card-cuerpo">
              <p class="card-titulo">${t.nombre}</p>
              <p class="card-detalle">${t.descripcion || 'Sin descripción'}</p>
            </div>
          </div>
          <button class="${btnClass}" onclick="inscribirseAlTema(${t.id})" ${btnDisabled} style="margin-top: 12px;">
            ${btnTexto}
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="seccion-header">
        <div>
          <h2>Materias disponibles</h2>
          <p class="seccion-sub">Materias de tu carrera disponibles para inscribirse.</p>
        </div>
      </div>
      <div class="grid-cards">${filas}</div>
    `;
  } catch (err) {
    console.error('Error al cargar materias disponibles:', err);
    return `
      <div class="seccion-header">
        <div>
          <h2>Materias disponibles</h2>
        </div>
      </div>
      <p class="vacio">Error al cargar las materias disponibles.</p>
    `;
  }
}

/* ============================================================
   ALUMNO - Funciones de inscripción
============================================================ */

async function inscribirseAlTema(temaId) {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('No se pudo identificar tu usuario.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/tema-alumno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumnoId: userId, temaId })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'No se pudo realizar la inscripción.');
      return;
    }

    alert('¡Te has inscripto correctamente!');
    mostrarSeccion('materias-disponibles');
  } catch (err) {
    console.error('Error al inscribirse:', err);
    alert('Error al conectar con el servidor.');
  }
}

/* ---------------- Router de secciones ---------------- */

const RENDERS = {
  'temas': renderTemas,
  'preguntas': renderPreguntas,
  'ubicaciones': renderUbicaciones,
  'respuestas': renderRespuestas,
  'preguntas-cercanas': renderPreguntasCercanas,
  'mis-respuestas': renderMisRespuestas,
  'mis-temas': renderMisTemas,
  'materias-disponibles': renderMateriasDisponibles
};
