const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");
const mqtt= require("mqtt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Configuración de Oracle
const dbConfig = {
  user: "C##TIERRAENCALMA",     // 👈 usuario Oracle real
  password: "Tierraencalma",    // 👈 clave
  connectString: "localhost:1521/XE"
};

// ======================= USUARIOS =======================

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
      // 👇 devolvemos el usuario para que el frontend guarde su id en localStorage
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



=======
// ======================= PLANTAS =======================

// 🔹 Registrar planta en PLANTAS_USUARIO
app.post("/api/registrar-planta", async (req, res) => {
  const { id_usuario, id_planta } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO PLANTAS_USUARIO (ID_PLANTA, ID_USUARIO, ESTADO) 
       VALUES (:id_planta, :id_usuario, 'Viva')`,
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

// ======================= INICIO SERVIDOR =======================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);

});
