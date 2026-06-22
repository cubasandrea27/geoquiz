
function cambiarRol(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');

  rolSeleccionado = rol;

  var campoNombre = document.getElementById('campo-nombre');

  if (rol === 'docente') {
    campoNombre.style.display = 'block';
  } else {
    campoNombre.style.display = 'none';
    document.getElementById('nombre').value = '';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnIngresar = document.getElementById("btnIngresar");

  if (!btnIngresar) return;

  btnIngresar.addEventListener("click", () => {
    const dni = document.getElementById("dni").value;

    if (!dni.trim()) {
      alert("Ingresá tu DNI");
      return;
    }

    localStorage.setItem("rol", rolSeleccionado);
    localStorage.setItem("dni", dni);

    window.location.href = "index.html";
  });
});
