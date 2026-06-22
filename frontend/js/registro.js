let rolSeleccionado = 'alumno';

function cambiarRolRegistro(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');

  rolSeleccionado = rol;

  const campoDni = document.getElementById('campo-dni');
  const campoEmail = document.getElementById('campo-email');
  const inputDni = document.getElementById('dni');

  if (rol === 'alumno') {
    campoDni.style.display = 'block';
    campoEmail.style.display = 'none';
    inputDni.type = 'text';
    inputDni.placeholder = 'Ingresá tu DNI';
    inputDni.setAttribute('inputmode', 'numeric');
    inputDni.setAttribute('pattern', '[0-9]*');
    inputDni.setAttribute('maxlength', '8');
  } else {
    campoDni.style.display = 'none';
    campoEmail.style.display = 'block';
    inputDni.value = '';
    inputDni.removeAttribute('inputmode');
    inputDni.removeAttribute('pattern');
    inputDni.removeAttribute('maxlength');
  }
}

async function registrarUsuario() {
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const password = document.getElementById('password').value.trim();
  const dni = document.getElementById('dni').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!nombre || !apellido || !password || (rolSeleccionado === 'alumno' ? !dni : !email)) {
    alert('Completá todos los campos obligatorios.');
    return;
  }

  if (rolSeleccionado === 'alumno' && !/^[0-9]{8}$/.test(dni)) {
    alert('El DNI debe tener exactamente 8 dígitos numéricos.');
    return;
  }

  const url = rolSeleccionado === 'alumno'
    ? 'http://localhost:3000/api/alumnos/register'
    : 'http://localhost:3000/api/docentes/register';

  const body = rolSeleccionado === 'alumno'
    ? { nombre, apellido, dni, password }
    : { nombre, apellido, email, password };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al registrar el usuario.');
      return;
    }

    alert('Registro exitoso. Ahora podés ingresar.');
    window.location.href = 'index.html';
  } catch (error) {
    alert('No se pudo conectar con el servidor.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnRegistrar').addEventListener('click', registrarUsuario);
});
