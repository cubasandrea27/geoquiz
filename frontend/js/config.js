// El backend Node escucha en el puerto 3000 del equipo que sirve la aplicación.
// Se obtiene el hostname de la página para que el mismo código funcione desde
// localhost, desde una IP de red local o desde un dominio publicado.
const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;