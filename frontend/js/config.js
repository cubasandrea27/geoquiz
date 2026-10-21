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
