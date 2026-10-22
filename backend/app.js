require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./utils/db');

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN;
app.use(cors({
  origin(origin, callback) {
    // Permite llamadas sin origen (curl, health checks) y, en desarrollo,
    // mantiene compatibilidad con los distintos puertos de XAMPP.
    if (!origin || (process.env.NODE_ENV !== 'production' && !allowedOrigin) || origin === allowedOrigin) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  }
}));
app.use(express.json());
app.use(express.text({ type: ['text/csv', 'application/csv'], limit: '2mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

// Rutas
app.use('/api/docentes',   require('./routes/docentes'));
app.use('/api/alumnos',    require('./routes/alumnos'));
app.use('/api/temas',      require('./routes/temas'));
app.use('/api/tema-alumno', require('./routes/tema_alumno'));
app.use('/api/preguntas',  require('./routes/preguntas'));
app.use('/api/respuestas', require('./routes/respuestas'));
app.use('/api/ubicaciones',require('./routes/ubicaciones'));
app.use('/api/reportes',   require('./routes/reportes'));
app.use('/api/usuarios',   require('./routes/usuarios'));
app.use('/api/notificaciones', require('./routes/notifications'));

module.exports = app;
