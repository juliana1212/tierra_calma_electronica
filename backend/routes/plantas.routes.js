const express = require('express');
const router = express.Router();
const { oracledb, dbConfig } = require('../config/db');

// Registrar planta en jardín de usuario
router.post('/registrar-planta', async (req, res) => {
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
        res.send({ message: 'Planta registrada con éxito en tu jardín' });
    } catch (err) {
        console.error('Error al registrar planta:');
        console.error(`Código: ${err.errorNum || err.code}`);
        console.error(`Mensaje: ${err.message}`);
        res.status(500).send({ error: 'Error al registrar planta' });
    }
});

// Banco de plantas
router.get('/plantas', async (req, res) => {
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
        console.error('Error al obtener plantas:');
        console.error(`Código: ${err.errorNum || err.code}`);
        console.error(`Mensaje: ${err.message}`);
        res.status(500).json({ error: 'Error al obtener la lista de plantas' });
    }
});

// Mis plantas
router.get('/mis-plantas', async (req, res) => {
    const raw = req.header('x-user-id');
    const id_usuario = Number(raw);
    if (!Number.isInteger(id_usuario)) {
        return res.status(400).json({ error: 'x-user-id inválido' });
    }

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT 
         pu.ID_PLANTA_USUARIO    AS ID_PLANTA_USUARIO,
         bp.ID_PLANTA            AS ID_PLANTA,
         bp.NOMBRE_COMUN         AS NOMBRE_COMUN,
         bp.NOMBRE_CIENTIFICO    AS NOMBRE_CIENTIFICO
       FROM TIERRA_EN_CALMA.PLANTAS_USUARIO pu
       JOIN TIERRA_EN_CALMA.BANCO_PLANTAS bp
         ON pu.ID_PLANTA = bp.ID_PLANTA
      WHERE pu.ID_USUARIO = :id_usuario`,
            { id_usuario },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows ?? []);
    } catch (err) {
        console.error('Error al obtener plantas del usuario:', err);
        res.status(500).json({ error: 'Error al obtener las plantas del usuario' });
    } finally {
        if (connection) try { await connection.close(); } catch { }
    }
});

module.exports = router;
