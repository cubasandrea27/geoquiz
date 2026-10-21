// El backend Node escucha en el puerto 3000 del equipo que sirve la aplicación.
// Se obtiene el hostname de la página para que el mismo código funcione desde
// localhost, desde una IP de red local o desde un dominio publicado.
const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;

function getAuthHeaders(extra = {}) {
  const token = (localStorage.getItem('token') || '').trim();
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : { ...extra };
}

// Datos de sesión que guarda el login. Se usan para cerrar sesión.
const CLAVES_SESION = ['rol', 'dni', 'email', 'nombre', 'userId', 'docenteId', 'token', 'isLoggedIn'];

function borrarSesion() {
  CLAVES_SESION.forEach(clave => localStorage.removeItem(clave));
}

// Si el token venció o no es válido, se borra la sesión y se vuelve al login.
// El mensaje se guarda para mostrarlo en la pantalla de login.
function cerrarSesionVencida() {
  borrarSesion();
  sessionStorage.setItem('mensajeLogin', 'Tu sesión venció. Volvé a iniciar sesión.');
  window.location.href = 'index.html';
}

// fetch para las rutas protegidas: agrega el token y controla la sesión vencida (401).
async function fetchConToken(url, opciones = {}) {
  const res = await fetch(url, { ...opciones, headers: getAuthHeaders(opciones.headers || {}) });

  if (res.status === 401) {
    cerrarSesionVencida();
    throw new Error('Tu sesión venció. Volvé a iniciar sesión.');
  }

  return res;
}

// Lee el JSON de la respuesta. Si el servidor no devolvió JSON (por ejemplo,
// una página de error), devuelve un objeto vacío en vez de romper.
async function leerJson(res) {
  try {
    return await res.json();
  } catch (error) {
    return {};
  }
}

// Escapa los caracteres especiales antes de meter un texto en innerHTML,
// así un nombre o enunciado con "<script>" se muestra como texto y no se ejecuta.
function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Arma un mensaje claro para el usuario según el error que devolvió el servidor.
function mensajeDeError(res, data, mensajePorDefecto) {
  if (data && data.error) return data.error;
  if (res.status === 400) return 'Revisá los datos ingresados.';
  if (res.status === 403) return 'No tenés permiso para hacer esto.';
  if (res.status === 404) return 'No se encontró lo que buscabas.';
  if (res.status >= 500) return 'El servidor tuvo un problema. Probá de nuevo en un rato.';
  return mensajePorDefecto;
}
