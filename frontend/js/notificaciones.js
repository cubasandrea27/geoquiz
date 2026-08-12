/* Notificaciones tipo "cartelito" para reemplazar los alert().
   Uso:
     mostrarNotificacion('El DNI ya está registrado', 'error');
     mostrarNotificacion('Registro exitoso', 'exito');
     mostrarNotificacion('Revisá tu conexión', 'info');

   Para usarlo en una página:
     1) <link rel="stylesheet" href="../css/notificaciones.css">
     2) <script src="../js/notificaciones.js"></script> (antes que script.js/registro.js)
     3) Reemplazar alert('...') por mostrarNotificacion('...', 'error')
*/

function obtenerContenedorNotificaciones() {
  let contenedor = document.getElementById('contenedor-notificaciones');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'contenedor-notificaciones';
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

function mostrarNotificacion(mensaje, tipo = 'info', duracionMs = 4000) {
  const contenedor = obtenerContenedorNotificaciones();

  const noti = document.createElement('div');
  noti.className = `notificacion notificacion-${tipo}`;
  noti.textContent = mensaje;
  contenedor.appendChild(noti);

  // Forzar reflow para que la transición de entrada se vea
  requestAnimationFrame(() => noti.classList.add('visible'));

  setTimeout(() => {
    noti.classList.remove('visible');
    setTimeout(() => noti.remove(), 200);
  }, duracionMs);
}
