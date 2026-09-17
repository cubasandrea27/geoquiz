#  GeoQuiz

Sistema de preguntas interactivo basado en ubicación GPS. Los alumnos responden preguntas según su posición geográfica en tiempo real.

##  Descripción

Plataforma web donde el **docente** crea temas, preguntas y coordenadas GPS. Los **alumnos** se autentican y reciben preguntas según la ubicación donde se encuentran físicamente.

## Equipo

| Integrante | Rol |
|------------|-----|
| Cubas Andrea | Backend |
| Paz Isaac | Backend |
| Aranda Ariel | Frontend |
| Battiston Santiago | Frontend |
| Aguilar Sofia | Documentación |
| Martinez Alexis | Documentación |

##  Stack tecnológico

- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Frontend:** HTML, CSS y JavaScript
- **Autenticación:** JWT
- **GPS:** API Geolocation del navegador
- **Mapa:** Leaflet + OpenStreetMap

## Estructura del repositorio

```
geoquiz/
├── backend/
│   ├── routes/
│   │   ├── alumnos.js
│   │   ├── docentes.js
│   │   ├── preguntas.js
│   │   ├── respuestas.js
│   │   ├── temas.js
│   │   └── ubicaciones.js
│   ├── controllers/
│   ├── utils/
│   │   └── db.js
│   ├── database/
│   │   └── geoquiz.sql
│   ├── .env.example
│   ├── package.json
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   └── pages/
├── .gitignore
└── README.md

## Instalación

### Requisitos previos

- Node.js >= 18
- MySQL (XAMPP recomendado)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/cubasandrea27/geoquiz.git
cd geoquiz

# 2. Configurar variables de entorno
# Crear backend/.env y completar las credenciales de MySQL

# 3. Importar la base de datos
# Abrir phpMyAdmin y importar backend/database/geoquiz.sql

# 4. Instalar dependencias del backend
cd backend
npm install

# 5. Iniciar el backend desde Windows PowerShell
npm start
```

En otra ventana, iniciar **Apache** y **MySQL** desde XAMPP. Luego abrir:

```text
http://localhost/geoquiz/
```

La API queda disponible en:

```text
http://localhost:3000
```

No ejecutar dos instancias del backend al mismo tiempo. Si el puerto 3000 ya
esta ocupado, cerrar la instancia anterior antes de ejecutar `npm start`.

## Variables de entorno (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=geoquiz
DB_USER=root
DB_PASSWORD=

PORT=3000
JWT_SECRET=geoquiz2026
JWT_EXPIRES_IN=8h
```

## Probar desde el celular (ngrok)

La API de Geolocalización del navegador (`navigator.geolocation`) solo
funciona en **contextos seguros (HTTPS)**, salvo en `localhost`. Por eso,
para probar el GPS real desde un celular conectado por wifi, no alcanza con
abrir la IP de la PC por HTTP: hay que exponer el proyecto por HTTPS. La
forma más simple es un túnel con **ngrok**.

### 1. Instalar y configurar ngrok

1. Descargar el instalador desde [ngrok.com/download](https://ngrok.com/download)
   e instalarlo.
2. Crear una cuenta gratuita en [ngrok.com](https://ngrok.com).
3. Copiar el authtoken desde el dashboard y cargarlo una sola vez:
   ```bash
   ngrok config add-authtoken TU_TOKEN
   ```
4. El plan gratuito asigna automáticamente **un dominio fijo** ("Dev
   Domain"), del tipo `algo-random.ngrok-free.dev` o `.ngrok-free.app`. Se
   puede ver (y en algunos casos elegir el prefijo) en el dashboard, en
   **Universal Gateway → Domains**. No hace falta crear uno manualmente ni
   pagar nada; con ese dominio alcanza.

   El plan gratuito solo permite **un túnel/endpoint activo a la vez**, así
   que no se pueden levantar dos túneles (uno para el front y otro para el
   back) al mismo tiempo. Por eso el proyecto usa un proxy interno de
   Apache (ver punto 2) para que todo salga por un único túnel.

### 2. Configurar el proxy en Apache (`httpd.conf`)

Editar `xampp/apache/conf/httpd.conf` (¡no `.htaccess`!):

1. Confirmar que estas dos líneas estén **descomentadas** (sin `#` adelante)
   en la sección de `LoadModule`:
   ```apache
   LoadModule proxy_module modules/mod_proxy.so
   LoadModule proxy_http_module modules/mod_proxy_http.so
   ```
2. Agregar al final del archivo:
   ```apache
   ProxyPass /api http://localhost:3000/api
   ProxyPassReverse /api http://localhost:3000/api
   ```
3. Guardar y reiniciar Apache desde el Panel de Control de XAMPP (Stop →
   Start).

Con esto, cualquier request a `/api/...` que le llegue a Apache (puerto 80)
se redirige automáticamente al backend Node (puerto 3000), sin que el
frontend necesite saber la URL del backend. Por eso en
`frontend/js/config.js` la base de la API queda vacía:

```javascript
const API_BASE = '';
```

### 3. Levantar el túnel

Con Apache, MySQL y el backend (`npm start`) corriendo, en otra terminal:

```bash
ngrok http --domain=TU-DOMINIO.ngrok-free.dev 80
```

(Puerto **80**, no 3000 — el túnel apunta a Apache, que ya sabe redirigir
`/api` al backend internamente.)

### 4. Conectarse desde el celular

Abrir en el navegador del celular:

```text
https://TU-DOMINIO.ngrok-free.dev/geoquiz/frontend/pages/index.html
```

- La primera vez aparece un aviso de ngrok ("You are about to visit...");
  tocar **Visit Site** para continuar.
- Confirmar que la URL empiece con `https://` (no `http://`) antes de
  iniciar sesión: si el navegador no toma HTTPS, el pedido de permiso de
  ubicación falla en silencio, sin mostrar ningún cartel.
- Si el permiso de ubicación quedó bloqueado de una prueba anterior, hay
  que habilitarlo a mano desde el ícono de información del sitio (al lado
  de la URL) → Permisos → Ubicación → Permitir.

Para chequear rápido si el proxy y el backend están bien conectados, sin
depender del login, se puede abrir directamente:

```text
https://TU-DOMINIO.ngrok-free.dev/api/temas
```

Si devuelve un JSON (aunque sea `[]`), el túnel, el proxy y el backend
están funcionando correctamente.

##  Entidades principales

| Tabla | Descripción |
|-------|-------------|
| `docentes` | Usuarios docentes con acceso de administración |
| `alumnos` | Estudiantes, se autentican con DNI |
| `temas` | Agrupadores de preguntas, asignados por docente |
| `tema_alumno` | Inscripción de alumnos a temas (N:M) |
| `ubicaciones` | Coordenadas GPS con radio de detección |
| `preguntas` | Preguntas vinculadas a temas y ubicaciones |
| `opciones` | Opciones de respuesta (múltiple choice) |
| `respuestas` | Historial de respuestas de cada alumno |
| `bloqueos_pregunta` | Oculta preguntas 5 min tras ser respondidas |

##  Flujo principal

```
Docente crea tema → agrega preguntas + coordenadas → inscribe alumnos
                                    ↓
Alumno se autentica (DNI) → detecta ubicación GPS → ve pregunta del área
                                    ↓
                         Responde → se graba → pregunta oculta 5 min
```

## Uso del sistema

### Docente

1. Inicia sesion con email.
2. Crea un tema.
3. Selecciona el tema en **Ubicaciones GPS**.
4. Elige un punto en el mapa de OpenStreetMap o usa su ubicacion actual.
5. Define el radio de deteccion y guarda la ubicacion.
6. Crea preguntas y opciones para ese tema.
7. Registra alumnos mediante su DNI.
8. Consulta el reporte de respuestas por alumno y tema.

### Alumno

1. Inicia sesion con DNI.
2. Se inscribe en un tema activo.
3. Selecciona el tema y permite el acceso a la ubicacion del navegador.
4. El servidor compara la ubicacion del alumno con las ubicaciones del tema.
5. Solo aparecen preguntas dentro del radio configurado.
6. Al responder, se guarda la respuesta y la pregunta se bloquea durante 5 minutos.

La ubicacion del docente no representa automaticamente la ubicacion del
alumno. Para que aparezca una pregunta, el alumno debe estar fisicamente en
el lugar seleccionado o dentro de su radio de deteccion.

## Rutas principales de la API

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/api/docentes/register` | Registrar docente |
| `POST` | `/api/docentes/login` | Autenticar docente |
| `POST` | `/api/alumnos/register` | Registrar alumno |
| `POST` | `/api/alumnos/login` | Autenticar alumno |
| `GET` | `/api/temas` | Listar temas activos |
| `POST` | `/api/temas` | Crear tema |
| `POST` | `/api/ubicaciones` | Guardar coordenada GPS |
| `GET` | `/api/preguntas?temaId=...&alumnoId=...&lat=...&lng=...` | Buscar preguntas cercanas |
| `POST` | `/api/respuestas` | Guardar respuesta y bloqueo de 5 minutos |

## Credenciales de prueba

```text
Docente: jperez@escuela.edu / 12345678
Alumna: 12345678 / 12345678
Alumno: 87654321 / 87654321
```

##  Convenciones de branches

```
main                → producción estable
develop/backend     → equipo backend
develop/frontend    → equipo frontend
```

##  Proyecto académico

Prácticas Profesionalizantes