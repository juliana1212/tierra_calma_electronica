const express = require('express');
const router = express.Router();
const cuidadosService = require('../services/cuidadosService');

router.post('/cuidados', async (req, res) => {
    const { id_planta_usuario, fecha, tipo, detalles } = req.body;
    if (!id_planta_usuario || !fecha || !tipo) {
        return res
            .status(400)
            .json({ error: 'id_planta_usuario, fecha y tipo son obligatorios' });
    }

    try {
        const r = await cuidadosService.crearCuidado({
            id_planta_usuario: Number(id_planta_usuario),
            fecha,
            tipo_cuidado: tipo,
            detalle: detalles,
        });
        res.status(201).json({ id_cuidado: r.id_cuidado, id_riego: r.id_riego });
    } catch (e) {
        console.error('[API][CUIDADOS] error:', e.message);
        res.status(500).json({ error: 'No se pudo registrar el cuidado' });
    }
});

module.exports = router;
