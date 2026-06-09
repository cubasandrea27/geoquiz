# 🎯 Juego de Preguntas GPS

Sistema de preguntas interactivo basado en ubicación GPS. Los alumnos responden preguntas según su posición geográfica en tiempo real.

## 📋 Descripción

Plataforma web donde el **docente** crea temas, preguntas y coordenadas GPS. Los **alumnos** se autentican y reciben preguntas según la ubicación donde se encuentran físicamente.


| Rol | Responsabilidad |
|-----|----------------|
| 👨‍💻 Backend | Base de datos, API REST, lógica de negocio |
| 🎨 Frontend | Interfaces, reportes, integración GPS |
| 📄 Documentación | Casos de uso, DER, diagramas, manual |

## 🛠️ Stack tecnológico

- **Backend:** Node.js / Express 
- **Base de datos:** MySQL
- **Autenticación:** JWT
- **GPS:** API Geolocation del navegador

## 📁 Estructura del repositorio

```
juego-preguntas-gps/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── database/
│   │   └── juego_preguntas_bd.sql
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── assets/
│   └── package.json
├── docs/
│   ├── casos_de_uso/
│   ├── diagramas/
│   │   ├── DER/
│   │   ├── secuencia/
│   │   └── clases/
│   └── manual_usuario/
└── README.md
```

## 🚀 Instalación

### Requisitos previos

- Node.js >= 18
- MySQL >= 8.0

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/[usuario]/juego-preguntas-gps.git
cd juego-preguntas-gps

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# 3. Crear la base de datos
mysql -u root -p < backend/database/juego_preguntas_bd.sql

# 4. Instalar dependencias del backend
cd backend && npm install

# 5. Iniciar el servidor
npm run dev
```

## ⚙️ Variables de entorno (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=juego_preguntas
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=tu_secret_muy_seguro
PORT=3000
```

## 📊 Entidades principales

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

## 🔑 Flujo principal

```
Docente crea tema → agrega preguntas + coordenadas → inscribe alumnos
                                    ↓
Alumno se autentica (DNI) → detecta ubicación GPS → ve pregunta del área
                                    ↓
                         Responde → se graba → pregunta oculta 5 min
```

## 📌 Convenciones de branches

```
main          → producción estable
develop       → integración
feature/xxx   → nuevas funcionalidades
fix/xxx       → correcciones
```

## 📝 Licencia

Proyecto académico — Uso educativo.
