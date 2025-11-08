const express = require('express');
const router = express.Router();
const mqttService = require('../services/mqttService');

router.get('/datos', (req, res) => {
    res.json({ dato: mqttService.getUltimoDato() });
});

router.get('/historial', (req, res) => {
    res.json({ historial: mqttService.getHistorial() });
});

router.post('/monitorear', async (req, res) => {
    const idPlantaUsuario = Number(req.body?.id_planta_usuario);
    if (!Number.isInteger(idPlantaUsuario)) {
        return res.status(400).json({ ok: false, error: 'id_planta_usuario inválido' });
    }

    try {
        const idSensor = await mqttService.setSensorForPlanta(idPlantaUsuario);
        return res.json({ ok: true, id_sensor: idSensor });
    } catch (e) {
        console.error('[monitorear] error:', e);
        return res.status(500).json({ ok: false, error: 'No se pudo preparar el monitoreo' });
    }
});

router.post('/regar', async (req, res) => {
    const result = await mqttService.enviarComandoRiego();
    if (result.ok) {
        return res.json({ message: 'Comando de riego enviado', ...result });
    }
    return res.status(500).json({ error: 'No se pudo enviar el comando', ...result });
});

router.post('/regar-fisico', async (req, res) => {
    const result = await mqttService.enviarComandoFisicoRiego();
    if (result.ok) return res.json(result);
    return res.status(500).json(result);
});

module.exports = router;
