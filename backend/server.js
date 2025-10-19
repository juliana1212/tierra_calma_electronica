require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");
const mqtt = require("mqtt");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const nodemailer = require("nodemailer");

const swaggerDocument = YAML.load("./swagger.yaml");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ======================= CONFIG ORACLE =======================
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASS,
  connectString: process.env.ORACLE_CONN,
};

// ======================= TEST CONEXIÓN =======================
(async () => {
  console.log("Probando conexión a Oracle...");
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute("SELECT 'Conexión OK' FROM DUAL");
    console.log(`Conexión exitosa a Oracle: ${result.rows[0][0]}`);
    await conn.close();
  } catch (err) {
    console.error("Error al conectar con Oracle:", err.message);
  }
})();

// ======================= REGISTRO USUARIO =======================
app.post("/api/register", async (req, res) => {
  const { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena } = req.body;
  try {
    const conn = await oracledb.getConnection(dbConfig);
    await conn.execute(
      `INSERT INTO TIERRA_EN_CALMA.USUARIOS 
       (ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO, CONTRASENA)
       VALUES (:id_usuario, :nombre, :apellido, :telefono, :correo_electronico, :contrasena)`,
      { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena },
      { autoCommit: true }
    );
    await conn.close();
    res.send({ message: "Usuario registrado con éxito" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ======================= LOGIN =======================
app.post("/api/login", async (req, res) => {
  const { correo_electronico, contrasena } = req.body;
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      `SELECT ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO
       FROM TIERRA_EN_CALMA.USUARIOS
       WHERE CORREO_ELECTRONICO = :correo_electronico AND CONTRASENA = :contrasena`,
      { correo_electronico, contrasena },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    if (result.rows.length > 0)
      res.send({ message: "Login exitoso", user: result.rows[0] });
    else res.status(401).send({ message: "Credenciales inválidas" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
// ======================= RECUPERAR CONTRASEÑA =======================
app.post("/api/recuperar-contrasena", async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: "Correo electrónico requerido" });
  }

  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      `SELECT ID_USUARIO, NOMBRE, CONTRASENA 
       FROM TIERRA_EN_CALMA.USUARIOS 
       WHERE CORREO_ELECTRONICO = :correo`,
      [correo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No existe una cuenta con este correo." });
    }

    const usuario = result.rows[0];

    // 🔹 Configurar el envío de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Tierra en Calma" <${process.env.GMAIL_USER}>`,
      to: correo,
      subject: "🔐 Recuperación de contraseña - Tierra en Calma",
      html: `
        <h2>Hola ${usuario.NOMBRE},</h2>
        <p>Recibimos una solicitud para recuperar tu contraseña.</p>
        <p>Tu contraseña actual es:</p>
        <h3 style="color:#93511c;">${usuario.CONTRASENA}</h3>
        <p>Te recomendamos cambiarla después de iniciar sesión.</p>
        <br>
        <p>Atentamente,<br><b>Equipo Tierra en Calma 🌱</b></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de recuperación enviado a ${correo}`);
    res.json({ message: "Correo de recuperación enviado correctamente." });

  } catch (err) {
    console.error("Error al recuperar contraseña:", err);
    res.status(500).json({ error: "Error al enviar el correo de recuperación." });
  }
});

// ======================= NUEVA RUTA: CONTACTO (CORREO) =======================
app.post("/api/contacto", async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  // Configuración del transporte de correo (Gmail App Password)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Tierra en Calma" <${process.env.GMAIL_USER}>`,
    to: "tierraencalma.a@gmail.com",
    subject: `📩 Nuevo mensaje de contacto de ${nombre}`,
    html: `
      <h3>Nuevo mensaje desde el formulario de contacto</h3>
      <p><b>Nombre:</b> ${nombre}</p>
      <p><b>Correo:</b> ${correo}</p>
      <p><b>Mensaje:</b><br>${mensaje}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de contacto enviado por ${nombre} <${correo}>`);
    res.json({ message: "Mensaje enviado correctamente" });
  } catch (err) {
    console.error("Error al enviar correo:", err);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

// ======================= MQTT & PLANTAS =======================
const brokerUrl = process.env.MQTT_BROKER;
const mqttOptions = { username: process.env.MQTT_USER, password: process.env.MQTT_PASS };
const client = mqtt.connect(brokerUrl, mqttOptions);
const mqttTopic = process.env.MQTT_TOPIC;

let ultimoDato = "Esperando datos...";
let historial = [];

client.on("connect", () => {
  console.log("Conectado al broker MQTT");
  client.subscribe(mqttTopic);
});

client.on("message", (topic, message) => {
  const dato = message.toString();
  ultimoDato = dato;
  historial.push(dato);
});

app.get("/api/datos", (req, res) => res.json({ dato: ultimoDato }));
app.get("/api/historial", (req, res) => res.json({ historial }));

app.post("/api/regar", (req, res) => {
  client.publish("plantas/regar", "REGAR");
  res.json({ message: "Comando de riego enviado" });
});

// ======================= SWAGGER =======================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ======================= SERVER =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
