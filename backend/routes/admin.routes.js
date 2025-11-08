const express = require('express');
const router = express.Router();
const { oracledb, dbConfig } = require('../config/db');

router.get('/admin/vistas', async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const opts = { outFormat: oracledb.OUT_FORMAT_OBJECT };

        const [estado, riegos, alertas, cuidados] = await Promise.all([
            connection.execute(
                `SELECT * FROM (
           SELECT * FROM TIERRA_EN_CALMA.VW_ESTADO_PLANTAS_USUARIO 
           ORDER BY FECHA_HORA DESC
         ) WHERE ROWNUM <= 10`,
                [],
                opts
            ),
            connection.execute(
                `SELECT * FROM (
           SELECT * FROM TIERRA_EN_CALMA.VW_HISTORIAL_RIEGOS 
           ORDER BY FECHA_HORA DESC
         ) WHERE ROWNUM <= 10`,
                [],
                opts
            ),
            connection.execute(
                `SELECT * FROM (
           SELECT * FROM TIERRA_EN_CALMA.VW_ALERTAS_CONDICIONES 
           ORDER BY TEMPERATURA DESC
         ) WHERE ROWNUM <= 10`,
                [],
                opts
            ),
            connection.execute(
                `SELECT * FROM (
           SELECT * FROM TIERRA_EN_CALMA.VW_CUIDADOS_PROGRAMADOS 
           ORDER BY FECHA DESC
         ) WHERE ROWNUM <= 10`,
                [],
                opts
            ),
        ]);

        await connection.close();

        const normalizar = (arr) =>
            arr.map((r) =>
                Object.fromEntries(
                    Object.entries(r).map(([k, v]) => [k.toUpperCase(), v])
                )
            );

        res.json({
            estado_plantas: normalizar(estado.rows),
            historial_riegos: normalizar(riegos.rows),
            alertas_condiciones: normalizar(alertas.rows),
            cuidados_programados: normalizar(cuidados.rows),
        });
    } catch (err) {
        console.error('Error al obtener vistas del admin:', err);
        res
            .status(500)
            .json({ error: 'Error al consultar las vistas administrativas' });
    }
});

module.exports = router;
