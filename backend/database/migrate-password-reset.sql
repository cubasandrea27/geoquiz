-- Ejecutar una sola vez sobre una base GeoQuiz existente.
CREATE TABLE IF NOT EXISTS recuperacion_password (
  id             INT          NOT NULL AUTO_INCREMENT,
  usuario_tipo   VARCHAR(20)  NOT NULL,
  usuario_id     INT          NOT NULL,
  token_hash     CHAR(64)     NOT NULL,
  vence_en       DATETIME     NOT NULL,
  usado_en       DATETIME     NULL,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recuperacion_token (token_hash),
  KEY idx_recuperacion_usuario (usuario_tipo, usuario_id, usado_en, vence_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
