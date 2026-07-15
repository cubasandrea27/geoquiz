#  GeoQuiz

Sistema de preguntas interactivo basado en ubicación GPS. Los alumnos responden preguntas según su posición geográfica en tiempo real.

##  Descripción

Plataforma web donde el **docente** crea temas, preguntas y coordenadas GPS. Los **alumnos** se autentican y reciben preguntas según la ubicación donde se encuentran físicamente.

## 👥 Equipo

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

## 📁 Estructura del repositorio

```
geoquiz/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── alumnos.js
│   │   │   ├── docentes.js
│   │   │   ├── preguntas.js
│   │   │   ├── respuestas.js
│   │   │   ├── temas.js
│   │   │   └── ubicaciones.js
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   └── db.js
│   │   ├── app.js
│   │   └── server.js
│   ├── database/
│   │   └── geoquiz.sql
│   ├── .env.example
│   └── package.json
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
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# 3. Importar la base de datos
# Abrir phpMyAdmin y importar backend/database/geoquiz.sql

# 4. Instalar dependencias del backend
cd backend && npm install

# 5. Iniciar el servidor
npm run dev
```

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

##  Convenciones de branches

```
main                → producción estable
develop/backend     → equipo backend
develop/frontend    → equipo frontend
```

##  Proyecto académico

Prácticas Profesionalizantes