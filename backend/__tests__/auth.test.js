const express = require("express");
const request = require("supertest");

// Mocks de consola para no ensuciar output
const origLog = console.log;
const origError = console.error;
const origWarn = console.warn;

// Mock de db antes de importar el router
const mockGetConnection = jest.fn();

jest.mock("../config/db", () => ({
    oracledb: {
        getConnection: jest.fn(),
        OUT_FORMAT_OBJECT: 4002,
    },
    dbConfig: {
        user: "test_user",
        password: "test_pass",
        connectString: "TEST_CONN",
    },
}));

const { oracledb } = require("../config/db");
const authRoutes = require("../routes/auth.routes");

describe("auth.routes", () => {
    let app;

    beforeAll(() => {
        console.log = jest.fn();
        console.error = jest.fn();
        console.warn = jest.fn();
    });

    afterAll(() => {
        console.log = origLog;
        console.error = origError;
        console.warn = origWarn;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        app = express();
        app.use(express.json());
        app.use("/api", authRoutes);
    });

    // ------- REGISTER -------

    test("POST /api/register registra usuario exitosamente", async () => {
        const execute = jest.fn().mockResolvedValue({});
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const payload = {
            id_usuario: 1,
            nombre: "Juan",
            apellido: "Pérez",
            telefono: "123456789",
            correo_electronico: "juan@example.com",
            contrasena: "secreta",
        };

        const res = await request(app)
            .post("/api/register")
            .send(payload)
            .expect(200);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO TIERRA_EN_CALMA.USUARIOS"),
            payload,
            { autoCommit: true }
        );
        expect(close).toHaveBeenCalledTimes(1);
        expect(res.body).toEqual({ message: "Usuario registrado con éxito" });
    });

    test("POST /api/register retorna 500 si hay error en Oracle", async () => {
        oracledb.getConnection.mockRejectedValue(
            Object.assign(new Error("ORA-00942"), { errorNum: 942 })
        );

        const res = await request(app)
            .post("/api/register")
            .send({
                id_usuario: 2,
                nombre: "Error",
                apellido: "Test",
                telefono: "000",
                correo_electronico: "err@example.com",
                contrasena: "x",
            })
            .expect(500);

        expect(res.body).toHaveProperty("error", "Error al registrar usuario");
        expect(res.body).toHaveProperty("detalles");
    });

    // ------- LOGIN -------

    test("POST /api/login exitoso como user normal", async () => {
        const execute = jest.fn().mockResolvedValue({
            rows: [
                {
                    ID_USUARIO: 1,
                    NOMBRE: "Juan",
                    APELLIDO: "Pérez",
                    TELEFONO: "123456789",
                    CORREO_ELECTRONICO: "juan@example.com",
                },
            ],
        });
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const res = await request(app)
            .post("/api/login")
            .send({
                correo_electronico: "juan@example.com",
                contrasena: "secreta",
            })
            .expect(200);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(
            expect.stringContaining("FROM TIERRA_EN_CALMA.USUARIOS"),
            {
                correo_electronico: "juan@example.com",
                contrasena: "secreta",
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        expect(close).toHaveBeenCalledTimes(1);

        expect(res.body).toMatchObject({
            message: "Login exitoso",
            role: "user",
        });
        expect(res.body.user).toBeDefined();
        expect(res.body.user.CORREO_ELECTRONICO).toBe("juan@example.com");
    });

    test("POST /api/login exitoso como admin", async () => {
        const execute = jest.fn().mockResolvedValue({
            rows: [
                {
                    ID_USUARIO: 99,
                    NOMBRE: "Admin",
                    APELLIDO: "Root",
                    TELEFONO: "000",
                    CORREO_ELECTRONICO: "admin@tierraencalma.com",
                },
            ],
        });
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const res = await request(app)
            .post("/api/login")
            .send({
                correo_electronico: "admin@tierraencalma.com",
                contrasena: "adminpass",
            })
            .expect(200);

        expect(res.body).toMatchObject({
            message: "Login exitoso",
            role: "admin",
        });
        expect(res.body.user.CORREO_ELECTRONICO).toBe("admin@tierraencalma.com");
    });

    test("POST /api/login con credenciales inválidas retorna 401", async () => {
        const execute = jest.fn().mockResolvedValue({ rows: [] });
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const res = await request(app)
            .post("/api/login")
            .send({
                correo_electronico: "noexiste@example.com",
                contrasena: "wrong",
            })
            .expect(401);

        expect(res.body).toEqual({ message: "Credenciales inválidas" });
        expect(close).toHaveBeenCalledTimes(1);
    });

    test("POST /api/login retorna 500 si hay error en Oracle", async () => {
        oracledb.getConnection.mockRejectedValue(
            Object.assign(new Error("ORA-01017"), { errorNum: 1017 })
        );

        const res = await request(app)
            .post("/api/login")
            .send({
                correo_electronico: "juan@example.com",
                contrasena: "secreta",
            })
            .expect(500);

        expect(res.body).toHaveProperty("error", "Error al iniciar sesión");
    });
});
