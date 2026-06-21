function cambiarRol(btn, rol) {
  document.querySelectorAll('.rol').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');

  var campoNombre = document.getElementById('campo-nombre');

  if (rol === 'docente') {
    campoNombre.style.display = 'block';
  } else {
    campoNombre.style.display = 'none';
    document.getElementById('nombre').value = '';
  }
}