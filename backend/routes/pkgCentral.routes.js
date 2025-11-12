const express = require('express');
const router = express.Router();
const pkgCentralService = require('../services/pkgCentralService');


router.post('/verificar-condiciones', async (req, res) => {
    const idPlantaUsuario = Number(req.body?.id_planta_usuario);
    if (!Number.isInteger(idPlantaUsuario)) {
        return res
            .status(400)
            .json({ ok: false, error: 'id_planta_usuario inválido' });
    }

    try {
        const result = await pkgCentralService.verificarCondiciones(
            idPlantaUsuario
        );
        res.json(result);
    } catch (e) {
        console.error('[API][VERIFICAR_CONDICIONES] error:', e.message);
        res
            .status(500)
            .json({ ok: false, error: 'Error al verificar condiciones' });
    }
});

module.exports = router;
