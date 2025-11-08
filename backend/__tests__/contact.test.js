const express = require("express");
const request = require("supertest");

const mockSendMail = jest.fn();

jest.mock("nodemailer", () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail,
    })),
}));

const nodemailer = require("nodemailer");
const contactRoutes = require("../routes/contact.routes");

describe("contact.routes /contacto", () => {
    let app;
    const origLog = console.log;
    const origError = console.error;

    beforeAll(() => {
        console.log = jest.fn();
        console.error = jest.fn();
        process.env.GMAIL_USER = "test@tierraencalma.com";
        process.env.GMAIL_PASS = "dummy";
    });

    afterAll(() => {
        console.log = origLog;
        console.error = origError;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use("/api", contactRoutes);
    });

    test("400 si faltan campos obligatorios", async () => {
        const res = await request(app)
            .post("/api/contacto")
            .send({ nombre: "Juan" }) // faltan correo y mensaje
            .expect(400);

        expect(res.body).toEqual({ error: "Faltan campos obligatorios" });
        expect(nodemailer.createTransport).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("200 si el correo se envía correctamente", async () => {
        mockSendMail.mockResolvedValueOnce({ accepted: ["tierraencalma.a@gmail.com"] });

        const payload = {
            nombre: "Juan Pérez",
            correo: "juan@example.com",
            mensaje: "Hola, quiero más info.",
        };

        const res = await request(app)
            .post("/api/contacto")
            .send(payload)
            .expect(200);

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        expect(mockSendMail).toHaveBeenCalledTimes(1);

        const mailArgs = mockSendMail.mock.calls[0][0];
        expect(mailArgs).toMatchObject({
            from: `"Tierra en Calma" <${process.env.GMAIL_USER}>`,
            to: "tierraencalma.a@gmail.com",
            subject: `Nuevo mensaje de contacto de ${payload.nombre}`,
        });
        expect(mailArgs.html).toContain(payload.nombre);
        expect(mailArgs.html).toContain(payload.correo);
        expect(mailArgs.html).toContain(payload.mensaje);

        expect(res.body).toEqual({ message: "Mensaje enviado correctamente" });
    });

    test("500 si sendMail lanza error", async () => {
        mockSendMail.mockRejectedValueOnce(new Error("SMTP fail"));

        const res = await request(app)
            .post("/api/contacto")
            .send({
                nombre: "Juan",
                correo: "juan@example.com",
                mensaje: "Algo",
            })
            .expect(500);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(res.body).toEqual({ error: "Error al enviar el correo" });
    });
});
