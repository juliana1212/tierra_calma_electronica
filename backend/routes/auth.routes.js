const express = require('express');
const router = express.Router();
const { oracledb, dbConfig } = require('../config/db');

// Registro
router.post('/register', async (req, res) => {
    const { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena } = req.body;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `INSERT INTO TIERRA_EN_CALMA.USUARIOS 
       (ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO, CONTRASENA)
       VALUES (:id_usuario, :nombre, :apellido, :telefono, :correo_electronico, :contrasena)`,
            { id_usuario, nombre, apellido, telefono, correo_electronico, contrasena },
            { autoCommit: true }
        );

        await connection.close();
        res.send({ message: 'Usuario registrado con éxito' });
    } catch (err) {
        console.error('Error Oracle al registrar usuario:');
        console.error(`Código: ${err.errorNum || err.code}`);
        console.error(`Mensaje: ${err.message}`);
        res.status(500).send({
            error: 'Error al registrar usuario',
            detalles: err.message,
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `SELECT ID_USUARIO, NOMBRE, APELLIDO, TELEFONO, CORREO_ELECTRONICO
         FROM TIERRA_EN_CALMA.USUARIOS
        WHERE LOWER(CORREO_ELECTRONICO) = LOWER(:correo_electronico)
          AND CONTRASENA = :contrasena`,
            { correo_electronico, contrasena },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        await connection.close();

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            const correo = (usuario.CORREO_ELECTRONICO || '').trim().toLowerCase();
            const role = correo === 'admin@tierraencalma.com' ? 'admin' : 'user';

            console.log(`Login exitoso para ${correo} (rol: ${role})`);

            res.send({
                message: 'Login exitoso',
                user: usuario,
                role,
            });
        } else {
            console.warn(`Intento fallido de login: ${correo_electronico}`);
            res.status(401).send({ message: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error('Error en login:');
        console.error(`Código: ${err.errorNum || err.code}`);
        console.error(`Mensaje: ${err.message}`);
        res.status(500).send({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
