-- ============================================================
-- BASE DE DATOS: Juego de Preguntas GPS
-- ============================================================

CREATE DATABASE IF NOT EXISTS geoquiz
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE geoquiz;

-- ------------------------------------------------------------
-- DOCENTES
-- ------------------------------------------------------------
CREATE TABLE docentes (
  id          INT           NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100)  NOT NULL,
  apellido    VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,  -- hash bcrypt
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- ALUMNOS
-- ------------------------------------------------------------
CREATE TABLE alumnos (
  id          INT           NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100)  NOT NULL,
  apellido    VARCHAR(100)  NOT NULL,
  dni         VARCHAR(20)   NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,  -- hash del DNI por defecto
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- TEMAS
-- ------------------------------------------------------------
CREATE TABLE temas (
  id           INT           NOT NULL AUTO_INCREMENT,
  docente_id   INT           NOT NULL,
  nombre       VARCHAR(150)  NOT NULL,
  descripcion  TEXT,
  activo       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_temas_docente FOREIGN KEY (docente_id) REFERENCES docentes(id)
);

-- ------------------------------------------------------------
-- INSCRIPCION ALUMNO <-> TEMA  (N:M)
-- ------------------------------------------------------------
CREATE TABLE tema_alumno (
  id          INT       NOT NULL AUTO_INCREMENT,
  tema_id     INT       NOT NULL,
  alumno_id   INT       NOT NULL,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tema_alumno (tema_id, alumno_id),
  CONSTRAINT fk_ta_tema   FOREIGN KEY (tema_id)   REFERENCES temas(id),
  CONSTRAINT fk_ta_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

-- ------------------------------------------------------------
-- UBICACIONES (coordenadas GPS)
-- ------------------------------------------------------------
CREATE TABLE ubicaciones (
  id           INT            NOT NULL AUTO_INCREMENT,
  tema_id      INT            NOT NULL,
  nombre       VARCHAR(150),                    -- etiqueta opcional
  latitud      DECIMAL(10,7)  NOT NULL,
  longitud     DECIMAL(10,7)  NOT NULL,
  radio_metros INT            NOT NULL DEFAULT 50,  -- radio de detección
  activo       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ubic_tema FOREIGN KEY (tema_id) REFERENCES temas(id)
);

-- ------------------------------------------------------------
-- PREGUNTAS
-- ------------------------------------------------------------
CREATE TABLE preguntas (
  id            INT           NOT NULL AUTO_INCREMENT,
  tema_id       INT           NOT NULL,
  ubicacion_id  INT,                           -- NULL = aparece en cualquier ubic del tema
  enunciado     TEXT          NOT NULL,
  activo        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_preg_tema  FOREIGN KEY (tema_id)      REFERENCES temas(id),
  CONSTRAINT fk_preg_ubic  FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id)
);

-- ------------------------------------------------------------
-- OPCIONES DE RESPUESTA (múltiple choice)
-- ------------------------------------------------------------
CREATE TABLE opciones (
  id           INT           NOT NULL AUTO_INCREMENT,
  pregunta_id  INT           NOT NULL,
  texto        VARCHAR(500)  NOT NULL,
  es_correcta  TINYINT(1)    NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_opc_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id)
);

-- ------------------------------------------------------------
-- RESPUESTAS DE ALUMNOS
-- ------------------------------------------------------------
CREATE TABLE respuestas (
  id             INT            NOT NULL AUTO_INCREMENT,
  alumno_id      INT            NOT NULL,
  pregunta_id    INT            NOT NULL,
  opcion_id      INT,                           -- NULL si respuesta abierta
  respuesta_texto TEXT,                         -- para respuesta abierta (si se usa)
  es_correcta    TINYINT(1)     NOT NULL DEFAULT 0,
  latitud_resp   DECIMAL(10,7),                 -- coordenada donde respondió
  longitud_resp  DECIMAL(10,7),
  respondida_en  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_resp_alumno   FOREIGN KEY (alumno_id)  REFERENCES alumnos(id),
  CONSTRAINT fk_resp_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id),
  CONSTRAINT fk_resp_opcion   FOREIGN KEY (opcion_id)  REFERENCES opciones(id)
);

-- Índice para buscar rápido "¿este alumno ya respondió esta pregunta?"
CREATE INDEX idx_resp_alumno_preg ON respuestas(alumno_id, pregunta_id);

-- ------------------------------------------------------------
-- BLOQUEO TEMPORAL (pregunta oculta 5 min tras respuesta)
-- ------------------------------------------------------------
CREATE TABLE bloqueos_pregunta (
  id              INT       NOT NULL AUTO_INCREMENT,
  alumno_id       INT       NOT NULL,
  pregunta_id     INT       NOT NULL,
  bloqueada_hasta DATETIME  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bloqueo (alumno_id, pregunta_id),
  CONSTRAINT fk_blq_alumno   FOREIGN KEY (alumno_id)   REFERENCES alumnos(id),
  CONSTRAINT fk_blq_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id)
);

-- ============================================================
-- DATOS DE PRUEBA (comentar en producción)
-- ============================================================

INSERT INTO docentes (nombre, apellido, email, password) VALUES
  ('Juan', 'Pérez', 'jperez@escuela.edu', '$2b$10$HASH_EJEMPLO');

INSERT INTO alumnos (nombre, apellido, dni, password) VALUES
  ('María', 'García', '12345678', '$2b$10$HASH_EJEMPLO'),
  ('Carlos', 'López', '87654321', '$2b$10$HASH_EJEMPLO');

INSERT INTO temas (docente_id, nombre, descripcion) VALUES
  (1, 'Historia Argentina', 'Preguntas sobre historia nacional');

INSERT INTO tema_alumno (tema_id, alumno_id) VALUES (1, 1), (1, 2);

INSERT INTO ubicaciones (tema_id, nombre, latitud, longitud, radio_metros) VALUES
  (1, 'Plaza Central', -34.6037, -58.3816, 50),
  (1, 'Monumento Norte', -34.6010, -58.3850, 30);

INSERT INTO preguntas (tema_id, ubicacion_id, enunciado) VALUES
  (1, 1, '¿En qué año se declaró la Independencia Argentina?'),
  (1, 2, '¿Quién fue el primer presidente de Argentina?');

INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES
  (1, '1810', 0),
  (1, '1816', 1),
  (1, '1820', 0),
  (2, 'Bernardino Rivadavia', 1),
  (2, 'Manuel Belgrano', 0),
  (2, 'José de San Martín', 0);
