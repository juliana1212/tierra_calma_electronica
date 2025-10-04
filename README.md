# Tierra en Calma — Monitoreo y riego de plantas (IoT)
Este repositorio contiene un sistema IoT diseñado para el *monitoreo en tiempo real de la humedad del suelo* y el *control de riego de plantas*.
El sistema integra *Frontend, Backend, Base de Datos Oracle XE* y soporte de mensajería mediante *MQTT*.

## 1. Tecnologías y versiones utilizadas

| Componente    | Tecnología           | Versión recomendada |
| ------------- | -------------------- | ------------------- |
| Frontend      | Angular              | 17.x (mínimo 16)    |
| Frontend      | Node.js (para build) | 18.x                |
| Frontend      | Chart.js             | 4.x                 |
| Backend       | Node.js              | 18.x                |
| Backend       | Express              | 4.x                 |
| Backend       | oracledb (modo thin) | 6.x                 |
| Backend       | mqtt (paquete npm)   | 4.x                 |
| Base de datos | Oracle XE            | 21c                 |
| Contenedores  | Docker Desktop       | ≥ 4.x               |
| Orquestación  | Docker Compose       | v2                  |

## 2. Estructura del repositorio


tierra_calma_electronica/
├─ backend/             # API Node.js + Express + MQTT + Oracle
│  ├─ server.js
│  ├─ package.json
│  └─ .env              # Variables de entorno (no versionar)
├─ frontend/            # Aplicación Angular
│  ├─ src/...
│  └─ package.json
├─ database/            # Scripts de inicialización Oracle
│  └─ init/01_init.sql
├─ docker-compose.yml   # Orquestación de servicios
└─ README.md

## 3. Descarga del proyecto

Clonar el repositorio desde GitHub:

bash
git clone https://github.com/<usuario>/<repositorio>.git
cd tierra_calma_electronica

También es posible usar imágenes publicadas en Docker Hub:

bash
docker pull <usuario>/tierra-backend:v1
docker pull <usuario>/tierra-frontend:v7

## 4. Requisitos de instalación y ejecución

### 4.1 Ejecución local sin Docker

* Node.js 18 instalado.
* Angular CLI instalado globalmente:

  bash
  npm install -g @angular/cli
  
* Oracle XE 21c instalado localmente o acceso a un Oracle remoto.
* Broker MQTT accesible con credenciales válidas.

### 4.2 Ejecución con Docker

* Docker Desktop instalado.
* Docker Compose v2 instalado.
* Puertos disponibles en el host:

  * 4200 → Frontend
  * 3001 → Backend

## 5. Variables de entorno del Backend

El archivo backend/.env debe contener:

env
PORT=3000

* Configuración MQTT
MQTT_BROKER=mqtt://tierra.cloud.shiftr.io
MQTT_USER=tierra
MQTT_PASS=**************
MQTT_TOPIC=plantas/datos

* Configuración Oracle
ORACLE_USER=C##tierraencalma
ORACLE_PASS=1234
ORACLE_CONN=localhost:1521/xe

* Si se utiliza Docker Compose:
ORACLE_CONN=oracle-db:1521/XEPDB1

## 6. Instalación y ejecución local

### 6.1 Backend

bash
cd backend
npm install
npm start

La API queda disponible en http://localhost:3001.

Prueba rápida:

bash
curl http://localhost:3001/api-datos

### 6.2 Frontend

bash
cd frontend
npm install
ng serve -o

La aplicación se abre en http://localhost:4200.

## 7. Ejecución con Docker Compose

1. Construir y levantar los servicios:

   bash
   docker compose up -d --build
   
2. Acceder a los servicios:

   * Frontend → http://localhost:4200
   * Backend → http://localhost:3001

3. Consultar logs para verificar estado:

   bash
   docker compose logs -f oracle-db
   docker compose logs -f backend
   docker compose logs -f frontend

## 8. Inicialización de la base de datos

El directorio database/init/ incluye scripts SQL que crean usuario y tablas iniciales.
Si Oracle se levanta mediante Docker Compose, los scripts se ejecutan automáticamente.
En caso de Oracle local, deben ejecutarse manualmente con SQL*Plus o SQL Developer.

Tablas principales:

* USUARIOS(ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO, CONTRASENA)
* PLANTAS_USUARIO(ID_PLANTA, ID_USUARIO, ESTADO)

## 9. Endpoints principales de la API

* POST /api/register → Registro de usuario.
* POST /api/login → Inicio de sesión.
* POST /api/registrar-planta → Asociación de planta a usuario.
* GET /api/datos → Último dato MQTT recibido.
* GET /api/historial → Historial completo de datos MQTT.

## 10. Flujo de prueba recomendado

1. Levantar el sistema con Docker Compose:

   bash
   docker compose up -d
   
2. Registrar un usuario mediante POST /api/register.
3. Iniciar sesión mediante POST /api/login.
4. Registrar una planta mediante POST /api/registrar-planta.
5. Visualizar datos de humedad y control de riego en el frontend (http://localhost:4200).



