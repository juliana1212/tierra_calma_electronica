const express = require("express");
const request = require("supertest");

// Mocks compartidos para el módulo db
const mockGetConnection = jest.fn();
const mockExecute = jest.fn();
const mockClose = jest.fn();

// Mock del módulo ../config/db
jest.mock("../config/db", () => ({
    oracledb: {
        getConnection: mockGetConnection,
        OUT_FORMAT_OBJECT: 4002,
    },
    dbConfig: {
        user: "test",
        password: "test",
        connectString: "TEST_CONN",
    },
}));

// Importar después de definir el mock
const { oracledb } = require("../config/db");
const adminRoutes = require("../routes/admin.routes");

describe("GET /admin/vistas", () => {
    let app;
    const originalError = console.error;

    beforeAll(() => {
        // Silenciar errores en consola en tests
        console.error = jest.fn();
    });

    afterAll(() => {
        console.error = originalError;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // Configurar conexión mock por defecto
        mockExecute.mockReset();
        mockClose.mockReset().mockResolvedValue();

        mockGetConnection.mockReset().mockResolvedValue({
            execute: mockExecute,
            close: mockClose,
        });

        app = express();
        app.use(express.json());
        // Montamos el router igual que en server real (prefijo según tu uso)
        app.use("/api", adminRoutes);
    });

    test("responde 200 y retorna las vistas normalizadas", async () => {
        // 4 llamadas a execute en Promise.all
        mockExecute
            // estado
            .mockResolvedValueOnce({
                rows: [{ id_planta: 1, nombre: "Planta 1" }],
            })
            // riegos
            .mockResolvedValueOnce({
                rows: [{ id_riego: 10, accion: "Riego 1" }],
            })
            // alertas
            .mockResolvedValueOnce({
                rows: [{ tipo: "ALTA_TEMP", temperatura: 30 }],
            })
            // cuidados
            .mockResolvedValueOnce({
                rows: [{ tarea: "Podar", fecha: "2025-01-01" }],
            });

        const res = await request(app).get("/api/admin/vistas").expect(200);

        // Se llamó a getConnection con la config
        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);

        // Se ejecutaron 4 queries
        expect(mockExecute).toHaveBeenCalledTimes(4);

        // Se cerró la conexión
        expect(mockClose).toHaveBeenCalledTimes(1);

        // Estructura básica
        expect(res.body).toHaveProperty("estado_plantas");
        expect(res.body).toHaveProperty("historial_riegos");
        expect(res.body).toHaveProperty("alertas_condiciones");
        expect(res.body).toHaveProperty("cuidados_programados");

        // Normalización a mayúsculas
        expect(res.body.estado_plantas[0]).toEqual(
            expect.objectContaining({
                ID_PLANTA: 1,
                NOMBRE: "Planta 1",
            })
        );

        expect(res.body.historial_riegos[0]).toEqual(
            expect.objectContaining({
                ID_RIEGO: 10,
                ACCION: "Riego 1",
            })
        );

        expect(res.body.alertas_condiciones[0]).toEqual(
            expect.objectContaining({
                TIPO: "ALTA_TEMP",
                TEMPERATURA: 30,
            })
        );

        expect(res.body.cuidados_programados[0]).toEqual(
            expect.objectContaining({
                TAREA: "Podar",
                FECHA: "2025-01-01",
            })
        );
    });

    test("responde 500 si falla la conexión o la consulta", async () => {
        mockGetConnection.mockRejectedValueOnce(new Error("Oracle down"));

        const res = await request(app).get("/api/admin/vistas").expect(500);

        expect(res.body).toEqual({
            error: "Error al consultar las vistas administrativas",
        });

        // No debería intentar cerrar conexión si nunca se obtuvo
        expect(mockClose).not.toHaveBeenCalled();
    });
});
