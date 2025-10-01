const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");

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

app.listen(3000, () => {
  console.log("Servidor backend corriendo en http://localhost:3000");
});
