// Apache (XAMPP) redirige internamente /api hacia el backend Node
// (ver ProxyPass en httpd.conf), así que la API queda en el mismo
// origen que la página — sea que entres por IP local o por ngrok.
const API_BASE = '';