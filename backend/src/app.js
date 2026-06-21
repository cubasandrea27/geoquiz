const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/docentes',    require('./routes/docentes'));
app.use('/api/alumnos',     require('./routes/alumnos'));
app.use('/api/temas',       require('./routes/temas'));
app.use('/api/preguntas',   require('./routes/preguntas'));
app.use('/api/respuestas',  require('./routes/respuestas'));
app.use('/api/ubicaciones', require('./routes/ubicaciones'));

module.exports = app;
