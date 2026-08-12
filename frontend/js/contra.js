

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

    pasoPedido.style.display = 'none';
    pasoConfirmacion.style.display = 'block';
  });
});
