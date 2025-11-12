-- Crear base de datos
CREATE DATABASE hospital_queue;
GO

USE hospital_queue;
GO

-- Tabla de usuarios del sistema
CREATE TABLE users (
    id INT IDENTITY PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL,  -- admin | recep | triaje | medico
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- Tabla de clínicas
CREATE TABLE clinics (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(80) NOT NULL,
    code NVARCHAR(20) UNIQUE NOT NULL,
    active BIT NOT NULL DEFAULT 1
);
GO

-- Tabla de pacientes
CREATE TABLE patients (
    id INT IDENTITY PRIMARY KEY,
    code NVARCHAR(20) UNIQUE NULL,
    name NVARCHAR(120) NOT NULL,
    document NVARCHAR(30) NULL,
    phone NVARCHAR(20) NULL,
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- Tabla de tickets (turnos)
CREATE TABLE tickets (
    id INT IDENTITY PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id),
    clinic_id INT NULL REFERENCES clinics(id),
    priority TINYINT NULL,  -- 1 = alta, 2 = media, 3 = baja
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | triaged | in_service | done | no_show
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    triaged_at DATETIME2 NULL,
    called_at DATETIME2 NULL,
    finished_at DATETIME2 NULL
);
GO

-- Bitácora de eventos por ticket
CREATE TABLE ticket_events (
    id INT IDENTITY PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(id),
    type NVARCHAR(20) NOT NULL, -- create | triage | call | finish | no_show | skip
    at DATETIME2 DEFAULT SYSDATETIME(),
    meta NVARCHAR(MAX) NULL
);
GO

-- Índice único ya existe por UNIQUE en code
CREATE UNIQUE INDEX IX_clinics_code ON clinics(code);
