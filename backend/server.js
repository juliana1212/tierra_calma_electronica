require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");
const mqtt= require("mqtt");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Config Oracle
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASS,
  connectString: process.env.ORACLE_CONN
};


// 🔹 Registro
app.post("/api/register", async (req, res) => {
  const { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO usuarios (ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO, CONTRASENA)
       VALUES (:id_usuario, :nombre, :apellido, :telefono, :correo_electronico, :contrasena)`,
      { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena },
      { autoCommit: true }
    );

    await connection.close();
    res.send({ message: "Usuario registrado con éxito" });

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).send({ error: "Error al registrar usuario" });
  }
});

// 🔹 Login
app.post("/api/login", async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO
       FROM usuarios
       WHERE CORREO_ELECTRONICO = :correo_electronico
       AND CONTRASENA = :contrasena`,
      { correo_electronico, contrasena },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    if (result.rows.length > 0) {
      res.send({ message: "Login exitoso", user: result.rows[0] });
    } else {
      res.status(401).send({ message: "Credenciales inválidas" });
    }

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).send({ error: "Error al iniciar sesión" });
  }
});



// Config MQTT
const brokerUrl = process.env.MQTT_BROKER;
const options = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
};

// Cliente MQTT
const client = mqtt.connect(brokerUrl, options);
const mqttTopic = process.env.MQTT_TOPIC;

// Variables para guardar datos
let ultimoDato = "Esperando datos...";
let historial = [];

// Conexión al broker
client.on("connect", () => {
  console.log("Conectado al broker MQTT");
  client.subscribe(mqttTopic, (err) => {
    if (!err) {
      console.log(` Suscrito al topic ${mqttTopic}`);
    } else {
      console.error("Error al suscribirse al topic:", err);
    }
  });
});

// Recepción de mensajes
client.on("message", (topic, message) => {
  const dato = message.toString();
  console.log(`[MQTT] ${topic}: ${dato}`);
  ultimoDato = dato;
  historial.push(dato);
});

// Rutas API para el frontend
app.get("/api/datos", (req, res) => {
  res.json({ dato: ultimoDato });
});

app.get("/api/historial", (req, res) => {
  res.json({ historial });
});



// ======================= PLANTAS =======================

// 🔹 Registrar planta en PLANTAS_USUARIO
app.post("/api/registrar-planta", async (req, res) => {
  const { id_usuario, id_planta } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

await connection.execute(
  `INSERT INTO PLANTAS_USUARIO (ID_PLANTA, ID_USUARIO, ESTADO)
   VALUES (:id_planta, :id_usuario, 'activa')`,
  { id_planta, id_usuario },
  { autoCommit: true }
);


    await connection.close();
    res.send({ message: "🌱 Planta registrada con éxito en tu jardín" });

  } catch (err) {
    console.error("💥 Error al registrar planta:", err);
    res.status(500).send({ error: "Error al registrar planta" });
  }
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ======================= INICIO SERVIDOR =======================
app.listen(3000, () => {
  console.log("Servidor backend corriendo en http://localhost:3000");
});
