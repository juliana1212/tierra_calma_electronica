-- SCRIPT DE INICIALIZACIÓN DE TIERRA_EN_CALMA

-- Creación de las tablas y datos iniciales



ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET "_ORACLE_SCRIPT" = TRUE;
    
-- Usuario de la aplicación
CREATE USER TIERRA_EN_CALMA IDENTIFIED BY Tierracalma;
GRANT CONNECT, RESOURCE TO TIERRA_EN_CALMA;
ALTER USER TIERRA_EN_CALMA QUOTA UNLIMITED ON USERS;

-- Trabajar dentro del schema de la app
ALTER SESSION SET CURRENT_SCHEMA = TIERRA_EN_CALMA;
-- TABLA USUARIOS
CREATE TABLE usuarios (
    id_usuario NUMBER(15) PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL,
    apellido VARCHAR2(50),
    telefono VARCHAR2(15),
    correo_electronico VARCHAR2(100),
    contrasena VARCHAR2(100) NOT NULL
);

CREATE TABLE banco_plantas (
    id_planta NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_comun VARCHAR2(100) NOT NULL,
    nombre_cientifico VARCHAR2(150),
    req_temperatura_min NUMBER(4,1) CHECK (req_temperatura_min BETWEEN 0 AND 60),
    req_temperatura_max NUMBER(4,1) CHECK (req_temperatura_max BETWEEN 0 AND 60),
    req_humedad NUMBER(4,1) CHECK (req_humedad BETWEEN 0 AND 100),
    periodo_fertilizacion NUMBER(3),
    descripcion_cuidados VARCHAR2(255),
    periodo_poda NUMBER(3),
    clasificacion VARCHAR2(10) CHECK (clasificacion IN ('interior','exterior'))
);

CREATE TABLE plantas_usuario (
    id_planta_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_planta NUMBER NOT NULL,
    id_usuario NUMBER(15) NOT NULL,
    estado VARCHAR2(10) CHECK (estado IN ('activa','inactiva')) NOT NULL,
    nombre_personalizado VARCHAR2(100),
    FOREIGN KEY (id_planta) REFERENCES banco_plantas(id_planta),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE lectura_sensores (
    id_lectura NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_sensor NUMBER NOT NULL,
    temperatura NUMBER(4,1) CHECK (temperatura BETWEEN 0 AND 100),
    humedad NUMBER(4,1) CHECK (humedad BETWEEN 0 AND 100),
    fecha_hora TIMESTAMP NOT NULL
);

CREATE TABLE riego (
    id_riego NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_lectura NUMBER,
    fecha_hora TIMESTAMP NOT NULL,
    tipo_riego VARCHAR2(15) CHECK (tipo_riego IN ('manual','automatico')) NOT NULL,
    duracion_seg NUMBER(5),
    motivo VARCHAR2(50) NOT NULL,
    FOREIGN KEY (id_lectura) REFERENCES lectura_sensores(id_lectura)
);

CREATE TABLE sensores (
    id_sensor NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_planta_usuario NUMBER NOT NULL,
    tipo_sensor VARCHAR2(30) NOT NULL,
    FOREIGN KEY (id_planta_usuario) REFERENCES plantas_usuario(id_planta_usuario)
);

CREATE TABLE historial_cuidados (
    id_cuidado NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_planta_usuario NUMBER NOT NULL,
    id_riego NUMBER,
    fecha DATE NOT NULL,
    tipo_cuidado VARCHAR2(20) CHECK (tipo_cuidado IN ('riego','poda','fertilizacion')) NOT NULL,
    detalle VARCHAR2(255),
    FOREIGN KEY (id_planta_usuario) REFERENCES plantas_usuario(id_planta_usuario),
    FOREIGN KEY (id_riego) REFERENCES riego(id_riego)
);

-- Insertar datos iniciales

INSERT INTO banco_plantas (nombre_comun, nombre_cientifico, req_temperatura_min, req_temperatura_max, req_humedad, periodo_fertilizacion, descripcion_cuidados, periodo_poda, clasificacion)
VALUES ('Potus', 'Epipremnum aureum', 15, 30, 60, 30, 'Luz indirecta, riego moderado evitando encharcar.', 180, 'interior');

INSERT INTO banco_plantas (nombre_comun, nombre_cientifico, req_temperatura_min, req_temperatura_max, req_humedad, periodo_fertilizacion, descripcion_cuidados, periodo_poda, clasificacion)
VALUES ('Lengua de suegra', 'Sansevieria trifasciata', 12, 28, 40, 90, 'Muy resistente, riego esporádico y poca luz.', 365, 'interior');

INSERT INTO banco_plantas (nombre_comun, nombre_cientifico, req_temperatura_min, req_temperatura_max, req_humedad, periodo_fertilizacion, descripcion_cuidados, periodo_poda, clasificacion)
VALUES ('Palma Areca', 'Dypsis lutescens', 16, 27, 65, 30, 'Prefiere luz indirecta, mantener humedad moderada.', 120, 'interior');

INSERT INTO banco_plantas (nombre_comun, nombre_cientifico, req_temperatura_min, req_temperatura_max, req_humedad, periodo_fertilizacion, descripcion_cuidados, periodo_poda, clasificacion)
VALUES ('Dólar Aglaonema', 'Aglaonema spp.', 18, 26, 55, 60, 'Tolera poca luz, riego moderado, evitar exceso de agua.', 365, 'interior');

INSERT INTO banco_plantas (nombre_comun, nombre_cientifico, req_temperatura_min, req_temperatura_max, req_humedad, periodo_fertilizacion, descripcion_cuidados, periodo_poda, clasificacion)
VALUES ('Hoja de violín', 'Ficus lyrata', 18, 27, 60, 45, 'Luz brillante indirecta, riego moderado y evitar cambios bruscos.', 365, 'interior');

INSERT INTO banco_plantas (nombre_comun, nombre_cientifico, req_temperatura_min, req_temperatura_max, req_humedad, periodo_fertilizacion, descripcion_cuidados, periodo_poda, clasificacion)
VALUES ('Monstera', 'Monstera deliciosa', 18, 30, 70, 30, 'Luz indirecta, riego moderado, necesita tutor.', 180, 'interior');

COMMIT;
