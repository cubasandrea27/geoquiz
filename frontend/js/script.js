
let rolSeleccionado = 'alumno';

function cambiarRol(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');

  rolSeleccionado = rol;

  const labelCredencial = document.querySelector('label[for="dni"]');
  const inputCredencial = document.getElementById('dni');

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

document.addEventListener("DOMContentLoaded", () => {
  const btnIngresar = document.getElementById("btnIngresar");

  if (!btnIngresar) return;

  cambiarRol(document.querySelector('.rol.activo'), 'alumno');

  btnIngresar.addEventListener("click", async () => {
    const credencial = document.getElementById("dni").value.trim();
    const password = document.getElementById("password").value.trim();

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
      ? 'http://localhost:3000/api/alumnos/login'
      : 'http://localhost:3000/api/docentes/login';

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

      localStorage.setItem("rol", data.rol);
      localStorage.setItem("dni", rolSeleccionado === 'alumno' ? credencial : '');
      localStorage.setItem("email", rolSeleccionado === 'docente' ? credencial : '');
      localStorage.setItem("nombre", data.nombre || '');
      window.location.href = "dashboard.html";
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    }
  });
});
