const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/contacto', async (req, res) => {
    const { nombre, correo, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Tierra en Calma" <${process.env.GMAIL_USER}>`,
        to: 'tierraencalma.a@gmail.com',
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
        res.json({ message: 'Mensaje enviado correctamente' });
    } catch (err) {
        console.error('Error al enviar correo:', err);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

module.exports = router;
