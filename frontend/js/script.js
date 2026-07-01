let rolSeleccionado = 'alumno';
const STORAGE_KEY = 'geoquizUsers';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function cambiarRol(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
  rolSeleccionado = rol;

  const credencialInput = document.getElementById('credencial');
  if (rol === 'docente') {
    credencialInput.placeholder = 'Ingresá tu email';
  } else {
    credencialInput.placeholder = 'Ingresá tu DNI';
  }
  credencialInput.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const btnIngresar = document.getElementById('btnIngresar');

  if (!btnIngresar) return;

  btnIngresar.addEventListener('click', () => {
    const credencial = document.getElementById('credencial').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!credencial || !password) {
      alert('Completá tus datos para ingresar.');
      return;
    }

    const users = getStoredUsers();
    const key = `${rolSeleccionado}:${credencial.toLowerCase()}`;
    const user = users[key];

    if (user && user.password === password) {
      localStorage.setItem('rol', user.rol);
      localStorage.setItem('nombre', `${user.nombre} ${user.apellido}`.trim());
      window.location.href = 'dashboard.html';
      return;
    }

    const url = rolSeleccionado === 'alumno'
      ? 'http://localhost:3000/api/alumnos/login'
      : 'http://localhost:3000/api/docentes/login';

    const body = rolSeleccionado === 'alumno'
      ? { dni: credencial, password }
      : { email: credencial, password };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'No se pudo iniciar sesión.');
          return;
        }

        localStorage.setItem('rol', data.rol);
        localStorage.setItem('nombre', data.nombre || '');
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'dashboard.html';
      })
      .catch(() => {
        alert('No se pudo conectar con el servidor.');
      });
  });
});