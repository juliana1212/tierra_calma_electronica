require('dotenv').config();
const oracledb = require("oracledb");

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASS,
  connectString: process.env.ORACLE_CONN
};

// 🔹 Reemplaza estos valores por uno real de tu tabla USUARIOS
const testCorreo = "jjuliana@gmail.com";
const testPass = "Casasjuliana28";

async function probarLogin() {
  try {
    console.log("Intentando conectar a Oracle...");
    const conn = await oracledb.getConnection(dbConfig);
    console.log("✅ Conexión exitosa.");

    const sql = `
      SELECT ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO
      FROM TIERRA_EN_CALMA.USUARIOS
      WHERE CORREO_ELECTRONICO = :correo_electronico
      AND CONTRASENA = :contrasena
    `;

    const result = await conn.execute(
      sql,
      { correo_electronico: testCorreo, contrasena: testPass },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      console.log("🎉 Login exitoso. Datos del usuario:");
      console.table(result.rows);
    } else {
      console.log("❌ Credenciales inválidas o usuario no encontrado.");
    }

    await conn.close();
  } catch (err) {
    console.error("💥 Error al probar login:", err);
  }
}

probarLogin();
