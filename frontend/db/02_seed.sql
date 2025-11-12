USE hospital_queue;
GO
INSERT INTO clinics(name, code) VALUES
('Medicina General', 'MED'),
('Pediatría', 'PED'),
('Ginecología', 'GIN');
GO

-- Usuario admin (correo/clave demo)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='users')
BEGIN
  CREATE TABLE users(
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(120) NOT NULL UNIQUE,
    password_hash NVARCHAR(200) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
  );
END;
-- hash de "Admin123*" generado con bcrypt 10 rounds (cámbialo si quieres)
INSERT INTO users(name,email,password_hash,role)
VALUES('Administrador','admin@demo.test',
'$2b$10$wY8N6W8vF6nH2e3b0x1b5u3r3pTt7wJzj0pKQf5q2V8u8Oq3q5mKe','admin');
