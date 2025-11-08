// __tests__/plantas.routes.test.js
const express = require("express");
const request = require("supertest");

// Mock consola para no ensuciar
const origLog = console.log;
const origError = console.error;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = origLog;
    console.error = origError;
});

// Mock de oracledb/config antes de importar el router
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
const plantasRoutes = require("../routes/plantas.routes");

describe("plantas.routes", () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();

        app = express();
        app.use(express.json());
        app.use("/api", plantasRoutes);
    });

    // -------- POST /registrar-planta --------

    test("POST /api/registrar-planta registra planta con éxito", async () => {
        const execute = jest.fn().mockResolvedValue({});
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const body = { id_usuario: 1, id_planta: 10 };

        const res = await request(app)
            .post("/api/registrar-planta")
            .send(body)
            .expect(200);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO TIERRA_EN_CALMA.PLANTAS_USUARIO"),
            { id_planta: 10, id_usuario: 1 },
            { autoCommit: true }
        );
        expect(close).toHaveBeenCalledTimes(1);
        expect(res.body).toEqual({
            message: "Planta registrada con éxito en tu jardín",
        });
    });

    test("POST /api/registrar-planta retorna 500 en error Oracle", async () => {
        oracledb.getConnection.mockRejectedValue(
            Object.assign(new Error("ORA-00001"), { errorNum: 1 })
        );

        const res = await request(app)
            .post("/api/registrar-planta")
            .send({ id_usuario: 1, id_planta: 10 })
            .expect(500);

        expect(res.body).toEqual({ error: "Error al registrar planta" });
    });

    // -------- GET /plantas --------

    test("GET /api/plantas retorna lista de plantas", async () => {
        const execute = jest.fn().mockResolvedValue({
            rows: [
                { ID_PLANTA: 1, NOMBRE_COMUN: "Aloe" },
                { ID_PLANTA: 2, NOMBRE_COMUN: "Cactus" },
            ],
        });
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const res = await request(app).get("/api/plantas").expect(200);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(
            expect.stringContaining("FROM TIERRA_EN_CALMA.BANCO_PLANTAS"),
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        expect(close).toHaveBeenCalledTimes(1);
        expect(res.body).toEqual([
            { ID_PLANTA: 1, NOMBRE_COMUN: "Aloe" },
            { ID_PLANTA: 2, NOMBRE_COMUN: "Cactus" },
        ]);
    });

    test("GET /api/plantas retorna 500 en error Oracle", async () => {
        oracledb.getConnection.mockRejectedValue(
            Object.assign(new Error("ORA-00942"), { errorNum: 942 })
        );

        const res = await request(app).get("/api/plantas").expect(500);

        expect(res.body).toEqual({
            error: "Error al obtener la lista de plantas",
        });
    });

    // -------- GET /mis-plantas --------

    test("GET /api/mis-plantas retorna 400 si x-user-id es inválido", async () => {
        const res = await request(app)
            .get("/api/mis-plantas")
            .set("x-user-id", "no-numero")
            .expect(400);

        expect(res.body).toEqual({ error: "x-user-id inválido" });
        expect(oracledb.getConnection).not.toHaveBeenCalled();
    });

    test("GET /api/mis-plantas retorna plantas del usuario", async () => {
        const execute = jest.fn().mockResolvedValue({
            rows: [
                {
                    ID_PLANTA_USUARIO: 1,
                    ID_PLANTA: 10,
                    NOMBRE_COMUN: "Aloe",
                    NOMBRE_CIENTIFICO: "Aloe vera",
                },
            ],
        });
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const res = await request(app)
            .get("/api/mis-plantas")
            .set("x-user-id", "5")
            .expect(200);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(
            expect.stringContaining("FROM TIERRA_EN_CALMA.PLANTAS_USUARIO pu"),
            { id_usuario: 5 },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        expect(close).toHaveBeenCalledTimes(1);

        expect(res.body).toEqual([
            {
                ID_PLANTA_USUARIO: 1,
                ID_PLANTA: 10,
                NOMBRE_COMUN: "Aloe",
                NOMBRE_CIENTIFICO: "Aloe vera",
            },
        ]);
    });

    test("GET /api/mis-plantas retorna 500 en error Oracle", async () => {
        const execute = jest.fn().mockRejectedValue(new Error("ORA-00933"));
        const close = jest.fn().mockResolvedValue();

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const res = await request(app)
            .get("/api/mis-plantas")
            .set("x-user-id", "5")
            .expect(500);

        expect(res.body).toEqual({
            error: "Error al obtener las plantas del usuario",
        });
    });
});
