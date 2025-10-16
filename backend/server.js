require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");
const mqtt = require("mqtt");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ======================= CONFIGURACIÓN ORACLE =======================
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASS,
  connectString: process.env.ORACLE_CONN
};

// ======================= REGISTRO DE USUARIOS =======================
app.post("/api/register", async (req, res) => {
  const { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `INSERT INTO TIERRA_EN_CALMA.USUARIOS 
       (ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO, CONTRASENA)
       VALUES (:id_usuario, :nombre, :apellido, :telefono, :correo_electronico, :contrasena)`,
      { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena },
      { autoCommit: true }
    );

    console.log("✅ Usuario registrado:", result);
    await connection.close();

    res.send({ message: "Usuario registrado con éxito" });

  } catch (err) {
    console.error("❌ Error Oracle al registrar usuario:", err.message);
    res.status(500).send({
      error: "Error al registrar usuario",
      detalles: err.message // 👈 Aquí veremos el código exacto (ORA-XXXX)
    });
  }
});

// ======================= LOGIN =======================
app.post("/api/login", async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO
       FROM TIERRA_EN_CALMA.USUARIOS
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

// ======================= CONFIGURACIÓN MQTT =======================
const brokerUrl = process.env.MQTT_BROKER;
const mqttOptions = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
};

const client = mqtt.connect(brokerUrl, mqttOptions);
const mqttTopic = process.env.MQTT_TOPIC;

let ultimoDato = "Esperando datos...";
let historial = [];

client.on("connect", () => {
  console.log("Conectado al broker MQTT");
  client.subscribe(mqttTopic, (err) => {
    if (!err) console.log(`Suscrito al topic ${mqttTopic}`);
    else console.error("Error al suscribirse al topic:", err);
  });
});

client.on("message", (topic, message) => {
  const dato = message.toString();
  console.log(`[MQTT] ${topic}: ${dato}`);
  ultimoDato = dato;
  historial.push(dato);
});

// ======================= RUTAS MQTT =======================
app.get("/api/datos", (req, res) => {
  res.json({ dato: ultimoDato });
});

app.get("/api/historial", (req, res) => {
  res.json({ historial });
});

// ======================= PLANTAS =======================

// Activar riego (publica en MQTT)
app.post("/api/regar", (req, res) => {
  try {
    client.publish("plantas/regar", "REGAR");
    console.log("Comando de riego publicado en MQTT (topic plantas/regar)");
    res.json({ message: "Comando de riego enviado a la planta" });
  } catch (err) {
    console.error("Error publicando en MQTT:", err);
    res.status(500).json({ error: "Error al activar el riego" });
  }
});

// Registrar planta en PLANTAS_USUARIO
app.post("/api/registrar-planta", async (req, res) => {
  const { id_usuario, id_planta } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO TIERRA_EN_CALMA.PLANTAS_USUARIO 
       (ID_PLANTA, ID_USUARIO, ESTADO, NOMBRE_PERSONALIZADO)
       VALUES (:id_planta, :id_usuario, 'activa', NULL)`,
      { id_planta, id_usuario },
      { autoCommit: true }
    );

    await connection.close();
    res.send({ message: "Planta registrada con éxito en tu jardín" });

  } catch (err) {
    console.error("Error al registrar planta:", err);
    res.status(500).send({ error: "Error al registrar planta" });
  }
});

// ======================= SWAGGER =======================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ======================= INICIO SERVIDOR =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
