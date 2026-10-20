
let rolSeleccionado = 'alumno';

function getBasePath() {
  return window.location.pathname.includes('/frontend/pages/') ? '' : 'frontend/pages/';
}

function getDashboardPath() {
  // Fuerza a cargar la versión actual de la pantalla después del login y evita
  // que el navegador reutilice un dashboard anterior sin el envío del JWT.
  return `${getBasePath()}dashboard.html?v=auth-fix-20261020`;
}

function redirectIfLoggedIn() {
  if (localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('token')) {
    window.location.href = `${getBasePath()}dashboard.html`;
  } else if (localStorage.getItem('isLoggedIn') === 'true' && !localStorage.getItem('token')) {
    // Sesión creada por una versión anterior que todavía no guardaba JWT.
    // Se limpia para permitir un nuevo inicio de sesión sin bucles de redirección.
    localStorage.clear();
  }
}

function getCredentialInput() {
  return document.getElementById('credencial') || document.getElementById('dni');
}

function cambiarRol(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');

  rolSeleccionado = rol;

  const labelCredencial = document.querySelector('label[for="credencial"], label[for="dni"]');
  const inputCredencial = getCredentialInput();

  if (!labelCredencial || !inputCredencial) return;

  if (rol === 'docente') {
    labelCredencial.textContent = 'Email';
    inputCredencial.type = 'email';
    inputCredencial.placeholder = 'Ingresá tu email';
    inputCredencial.value = '';
    inputCredencial.removeAttribute('maxlength');
    inputCredencial.removeAttribute('pattern');
    inputCredencial.removeAttribute('inputmode');
  } else {
    labelCredencial.textContent = 'DNI';
    inputCredencial.type = 'text';
    inputCredencial.placeholder = 'Ingresá tu DNI';
    inputCredencial.value = '';
    inputCredencial.setAttribute('maxlength', '8');
    inputCredencial.setAttribute('pattern', '[0-9]*');
    inputCredencial.setAttribute('inputmode', 'numeric');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn();

  const btnIngresar = document.getElementById('btnIngresar');

  if (!btnIngresar) return;

  const activeRol = document.querySelector('.rol.activo');
  if (activeRol) {
    cambiarRol(activeRol, rolSeleccionado);
  }

  btnIngresar.addEventListener('click', async () => {
    const inputCredencial = getCredentialInput();
    const credencial = inputCredencial ? inputCredencial.value.trim() : '';
    const password = document.getElementById('password').value.trim();

    if (!credencial) {
      alert(rolSeleccionado === 'docente' ? 'Ingresá tu email' : 'Ingresá tu DNI');
      return;
    }

    if (rolSeleccionado === 'alumno' && !/^[0-9]{8}$/.test(credencial)) {
      alert('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }

    if (!password) {
      alert('Ingresá tu contraseña');
      return;
    }

    const url = rolSeleccionado === 'alumno'
      ? `${API_BASE}/api/alumnos/login`
      : `${API_BASE}/api/docentes/login`;

    const body = rolSeleccionado === 'alumno'
      ? { dni: credencial, password }
      : { email: credencial, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error de ingreso.');
        return;
      }

      if (!data.token) {
        alert('El servidor no devolvió una sesión válida. Reiniciá el backend e intentá nuevamente.');
        return;
      }

      localStorage.setItem('rol', data.rol);
      localStorage.setItem('dni', rolSeleccionado === 'alumno' ? credencial : '');
      localStorage.setItem('email', rolSeleccionado === 'docente' ? credencial : '');
      localStorage.setItem('nombre', data.nombre || '');
      localStorage.setItem('userId', data.id || '');
      localStorage.setItem('docenteId', data.id || '');
      localStorage.setItem('token', data.token || '');
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = getDashboardPath();
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    }
  });
});
