/* Recuperar contraseña.
   NOTA: todavía no existe un endpoint de backend para esto (no está en
   el README ni en las rutas). Por ahora el flujo queda armado del lado
   del front y muestra el mensaje de confirmación siempre, sin pegarle
   a ningún servidor. Cuando exista la ruta (ej: POST /api/alumnos/recuperar),
   reemplazar el bloque de abajo por un fetch() como los de script.js. */

document.addEventListener('DOMContentLoaded', () => {
  const btnPedir = document.getElementById('btnPedirRecuperacion');
  const pasoPedido = document.getElementById('paso-pedido');
  const pasoConfirmacion = document.getElementById('paso-confirmacion');

  btnPedir.addEventListener('click', () => {
    const credencial = document.getElementById('credencial-recuperar').value.trim();

    if (!credencial) {
      mostrarNotificacion('Ingresá tu DNI o email para continuar.', 'error');
      return;
    }

    // TODO: reemplazar por fetch() cuando el backend tenga la ruta de recuperación.
    pasoPedido.style.display = 'none';
    pasoConfirmacion.style.display = 'block';
  });
});
