let rolSeleccionado = 'alumno';
const STORAGE_KEY = 'geoquizUsers';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveUserLocally(user) {
  const users = getStoredUsers();
  const key = `${user.rol}:${user.identifier.toLowerCase()}`;
  users[key] = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function cambiarRolRegistro(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');

  rolSeleccionado = rol;

  const campoDni = document.getElementById('campo-dni');
  const campoEmail = document.getElementById('campo-email');
  const dniInput = document.getElementById('dni');
  const emailInput = document.getElementById('email');

  if (rol === 'alumno') {
    campoDni.style.display = 'block';
    campoEmail.style.display = 'none';
    dniInput.value = '';
    dniInput.removeAttribute('disabled');
    emailInput.value = '';
    emailInput.setAttribute('disabled', 'true');
  } else {
    campoDni.style.display = 'none';
    campoEmail.style.display = 'block';
    dniInput.value = '';
    dniInput.setAttribute('disabled', 'true');
    emailInput.value = '';
    emailInput.removeAttribute('disabled');
  }
}

async function registrarUsuario() {
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const password = document.getElementById('password').value.trim();
  const dni = document.getElementById('dni').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!nombre || !apellido || !password) {
    alert('Completá nombre, apellido y contraseña.');
    return;
  }

  if (rolSeleccionado === 'alumno' && !dni) {
    alert('Ingresá tu DNI para registrar un alumno.');
    return;
  }

  if (rolSeleccionado === 'docente' && !email) {
    alert('Ingresá tu email para registrar un docente.');
    return;
  }

  if (rolSeleccionado === 'alumno' && !/^[0-9]{8}$/.test(dni)) {
    alert('El DNI debe tener 8 dígitos.');
    return;
  }

  const userToSave = {
    rol: rolSeleccionado,
    nombre,
    apellido,
    identifier: rolSeleccionado === 'alumno' ? dni : email,
    password
  };

  try {
    const url = rolSeleccionado === 'alumno'
      ? 'http://localhost:3000/api/alumnos/register'
      : 'http://localhost:3000/api/docentes/register';

    const body = rolSeleccionado === 'alumno'
      ? { nombre, apellido, dni, password }
      : { nombre, apellido, email, password };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo guardar el usuario.');
      return;
    }

    saveUserLocally(userToSave);
    alert('Registro guardado correctamente. Ahora podés iniciar sesión.');
    window.location.href = 'index.html';
  } catch (error) {
    saveUserLocally(userToSave);
    alert('No se pudo conectar con el servidor, pero se guardó localmente.');
    window.location.href = 'index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnRegistrar').addEventListener('click', registrarUsuario);
});
