const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");
const mqtt= require("mqtt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Config Oracle
const dbConfig = {
  user: "C##tierraencalma",
  password: "1234",   // 👈 pon tu contraseña real
  connectString: "localhost:1521/xe"
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
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // 👈 devuelve objetos
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



// Config MQTT (igual que en tu ESP32)
const brokerUrl = "mqtt://tierra.cloud.shiftr.io";
const options = {
  username: "tierra",                // namespace
  password: "oaaLZr38fzynau0g"       // secret del token
};

// Cliente MQTT
const client = mqtt.connect(brokerUrl, options);

// Variables para guardar datos
let ultimoDato = "Esperando datos...";
let historial = [];

// Conexión al broker
client.on("connect", () => {
  console.log("Conectado al broker MQTT");
  client.subscribe("plantas/datos", (err) => {
    if (!err) {
      console.log("Suscrito al topic plantas/datos");
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


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
