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

    alert('No se encontró un usuario con esos datos.');
  });
});