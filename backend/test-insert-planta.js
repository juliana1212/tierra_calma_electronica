require('dotenv').config();
const oracledb = require('oracledb');

(async () => {
  try {
    const conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASS,
      connectString: process.env.ORACLE_CONN
    });

    console.log("✅ Conexión exitosa con Oracle");

    // Datos de prueba
    const id_planta = 25;  // Pothos
    const id_usuario = 100410154; // pon el ID real de tu tabla USUARIOS

    const result = await conn.execute(
      `INSERT INTO C##TIERRAENCALMA.PLANTAS_USUARIO 
       (ID_PLANTA_USUARIO, ID_PLANTA, ID_USUARIO, ESTADO, NOMBRE_PERSONALIZADO)
       VALUES (C##TIERRAENCALMA."ISEQ$$_77185".NEXTVAL, :id_planta, :id_usuario, 'activa', NULL)`,
      { id_planta, id_usuario },
      { autoCommit: true }
    );

    console.log("✅ Inserción realizada con éxito:", result);
    await conn.close();
  } catch (err) {
    console.error("❌ Error al insertar:", err);
  }
})();
