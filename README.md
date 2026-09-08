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