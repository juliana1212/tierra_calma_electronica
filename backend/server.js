require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");
const mqtt = require("mqtt");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const nodemailer = require("nodemailer");
const mqttService = require("./mqttService");
const cuidadosService = require("./cuidadosService");
console.log("Nodemailer cargado correctamente");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ======================= CONFIGURACIÓN ORACLE =======================
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASS,
  connectString: process.env.ORACLE_CONN
};

// ======================= TEST DE CONEXIÓN AL INICIAR =======================
(async () => {
  console.log("Probando conexión a Oracle...");
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute("SELECT 'Conexión OK' AS estado FROM DUAL");
    console.log(`Conexión exitosa a Oracle: ${result.rows[0][0]}`);
    await conn.close();
  } catch (err) {
    console.error("Error al conectar con Oracle al iniciar el servidor:");
    console.error(`Código: ${err.errorNum || err.code}`);
    console.error(`Mensaje: ${err.message}`);
  }
})();

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

    console.log("Usuario registrado:", result);
    await connection.close();

    res.send({ message: "Usuario registrado con éxito" });

  } catch (err) {
    console.error("Error Oracle al registrar usuario:");
    console.error(`Código: ${err.errorNum || err.code}`);
    console.error(`Mensaje: ${err.message}`);
    res.status(500).send({
      error: "Error al registrar usuario",
      detalles: err.message
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
      console.log(`Login exitoso para: ${correo_electronico}`);
      res.send({ message: "Login exitoso", user: result.rows[0] });
    } else {
      console.warn(`Intento fallido de login: ${correo_electronico}`);
      res.status(401).send({ message: "Credenciales inválidas" });
    }

  } catch (err) {
    console.error("Error en login:");
    console.error(`Código: ${err.errorNum || err.code}`);
    console.error(`Mensaje: ${err.message}`);
    res.status(500).send({ error: "Error al iniciar sesión" });
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
    subject: `Nuevo mensaje de contacto de ${nombre}`,
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



// ======================= CONFIGURACIÓN MQTT =======================
mqttService.initMQTT(process.env.MQTT_BROKER, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
}, process.env.MQTT_TOPIC);

app.get("/api/datos", (req, res) => {
  res.json({ dato: mqttService.getUltimoDato() });
});

app.get("/api/historial", (req, res) => {
  res.json({ historial: mqttService.getHistorial() });
});

app.post("/api/regar", (req, res) => {
  const enviado = mqttService.enviarComandoRiego();
  if (enviado) res.json({ message: "Comando de riego enviado" });
  else res.status(500).json({ error: "No se pudo enviar el comando" });
});

// ======================= PLANTAS =======================
app.post("/api/regar", (req, res) => {
  try {
    client.publish("plantas/regar", "REGAR");
    console.log("Comando de riego enviado (topic plantas/regar)");
    res.json({ message: "Comando de riego enviado a la planta" });
  } catch (err) {
    console.error("Error publicando en MQTT:", err);
    res.status(500).json({ error: "Error al activar el riego" });
  }
});

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
    console.log(`Planta registrada (usuario: ${id_usuario}, planta: ${id_planta})`);
    res.send({ message: "Planta registrada con éxito en tu jardín" });

  } catch (err) {
    console.error("Error al registrar planta:");
    console.error(`Código: ${err.errorNum || err.code}`);
    console.error(`Mensaje: ${err.message}`);
    res.status(500).send({ error: "Error al registrar planta" });
  }
});

// ======================= OBTENER LISTA DE PLANTAS =======================
app.get("/api/plantas", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT ID_PLANTA, NOMBRE_COMUN 
       FROM TIERRA_EN_CALMA.BANCO_PLANTAS
       ORDER BY NOMBRE_COMUN`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();
    res.json(result.rows); 
  } catch (err) {
    console.error("Error al obtener plantas:");
    console.error(`Código: ${err.errorNum || err.code}`);
    console.error(`Mensaje: ${err.message}`);
    res.status(500).json({ error: "Error al obtener la lista de plantas" });
  }
});

// ======================= OBTENER PLANTAS DE UN USUARIO =======================
app.get("/api/mis-plantas/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT bp.ID_PLANTA, bp.NOMBRE_COMUN, bp.NOMBRE_CIENTIFICO
       FROM TIERRA_EN_CALMA.PLANTAS_USUARIO pu
       JOIN TIERRA_EN_CALMA.BANCO_PLANTAS bp
       ON pu.ID_PLANTA = bp.ID_PLANTA
       WHERE pu.ID_USUARIO = :id_usuario`,
      [id_usuario],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener plantas del usuario:", err);
    res.status(500).json({ error: "Error al obtener las plantas del usuario" });
  }
});
// ======================= CUIDADOS =======================
app.post("/api/cuidados", async (req, res) => {
  const { id_planta_usuario, fecha, tipo, detalles } = req.body;
  if (!id_planta_usuario || !fecha || !tipo) {
    return res.status(400).json({ error: "id_planta_usuario, fecha y tipo son obligatorios" });
  }

  try {
    const r = await cuidadosService.crearCuidado({
      id_planta_usuario: Number(id_planta_usuario),
      fecha,                         // 'YYYY-MM-DD' o ISO
      tipo_cuidado: tipo,
      detalle: detalles,
    });
    res.status(201).json({ id_cuidado: r.id_cuidado, id_riego: r.id_riego });
  } catch (e) {
    console.error("[API][CUIDADOS] error:", e.message);
    res.status(500).json({ error: "No se pudo registrar el cuidado" });
  }
});
// ======================= SWAGGER =======================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ======================= INICIO SERVIDOR =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`Intentando conectar con Oracle: ${dbConfig.connectString}`);
});

// ======================= MANEJO GLOBAL DE ERRORES =======================
process.on("unhandledRejection", (reason, promise) => {
  console.error("Rechazo de promesa no manejado:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Error no capturado:", err);
});