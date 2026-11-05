-- Cuentas de demostración para clases y pruebas.
-- El script se puede ejecutar más de una vez sin crear duplicados.
USE geoquiz;

INSERT INTO docentes (nombre, apellido, email, password, activo) VALUES
  ('Ana', 'Martínez', 'ana.martinez@geoquiz.test', '$2b$10$2kF3TyifCgdf6k29oo8J/eRwPRf1572tA/f3QBFQBHG4geRbgXfU6', 1),
  ('Luis', 'Fernández', 'luis.fernandez@geoquiz.test', '$2b$10$..2lBgnSqY4V0slAusBYnelbvdqJXE/pzIu45EwjlPzn0DNYpoNEy', 1),
  ('Docente', 'Demo', 'docente.demo@geoquiz.test', '$2b$10$fgvSCyXLqiUzez4rLXsRKuc2h5oaDAWXgdOVsFUO6i2fR4LtE76g.', 1)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  password = VALUES(password),
  activo = 1;

INSERT INTO alumnos (nombre, apellido, dni, password, activo) VALUES
  ('Sofía', 'Gómez', '30000001', '$2b$10$6kAWEQ3ssNB4NiY9.ewPbOQFDsLHllP0.XIaZeITApSP7kgnTICqC', 1),
  ('Mateo', 'Rodríguez', '30000002', '$2b$10$nXE5vVKSwUtA2tl/9laFoeEFpMTkmq8VnXY9WZhYydgpBNhZgpY5O', 1),
  ('Valentina', 'Sosa', '30000003', '$2b$10$U3bIy2IM4hibYhkSRLzWDOR0A19ihlbv4pO0QqtvUA.Q6z4j1K/uS', 1),
  ('Benjamín', 'Torres', '30000004', '$2b$10$L0Zpm5s03McmJDZquDqIL.PTrQ5inn1g6fcPOdVNXLVqaXmgRJnbm', 1),
  ('Martina', 'Romero', '30000005', '$2b$10$M4c17X45CnXKpqEwf3GeNOCv7CAF41A53.q6f90m0BbzVl.OCryVm', 1),
  ('Joaquín', 'Díaz', '30000006', '$2b$10$6PbEGtxMli.kUt53ZFRezO1K.RTVp1wVw1zRfkQ1eUmnTV98Mv12W', 1)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  password = VALUES(password),
  activo = 1;
