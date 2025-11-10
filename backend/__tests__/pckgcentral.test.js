// __tests__/pckgcentral.test.js

jest.mock("oracledb", () => ({
    getConnection: jest.fn(),
    OUT_FORMAT_OBJECT: 4002,
    BIND_OUT: 3003,
    STRING: "STRING",
}));

jest.mock("../services/mqttService", () => ({
    enviarComandoFisicoRiego: jest.fn(),
}));

const oracledb = require("oracledb");
const mqttService = require("../services/mqttService");
const { verificarCondiciones } = require("../services/pkgCentralService.js");

describe("pkgcentralService.verificarCondiciones", () => {
    // Silenciar logs del servicio durante los tests
    const originalLog = console.log;
    const originalError = console.error;

    beforeAll(() => {
        console.log = jest.fn();
        console.error = jest.fn();
    });

    afterAll(() => {
        console.log = originalLog;
        console.error = originalError;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("retorna mensaje cuando no hay lecturas", async () => {
        const close = jest.fn().mockResolvedValue(); // <- close async
        const execute = jest.fn().mockResolvedValueOnce({ rows: [] });

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const resp = await verificarCondiciones(1);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(1);
        expect(resp).toEqual({
            ok: false,
            mensaje: "No hay lecturas registradas para esta planta.",
        });
        expect(mqttService.enviarComandoFisicoRiego).not.toHaveBeenCalled();
        expect(close).toHaveBeenCalled();
    });

    test("activa riego automático cuando condiciones lo requieren", async () => {
        const close = jest.fn().mockResolvedValue();
        const execute = jest
            .fn()
            .mockResolvedValueOnce({
                rows: [{ TEMPERATURA: 35, HUMEDAD: 30 }],
            })
            .mockResolvedValueOnce({
                outBinds: { out_msg: "Riego automático activado" },
            });

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const resp = await verificarCondiciones(10);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledTimes(2);
        expect(mqttService.enviarComandoFisicoRiego).toHaveBeenCalledTimes(1);
        expect(resp.ok).toBe(true);
        expect(resp.mensaje).toContain("Riego automático activado");
        expect(resp.mensaje).toContain("35°C / 30%");
        expect(close).toHaveBeenCalled();
    });

    test("no activa riego cuando no se requiere", async () => {
        const close = jest.fn().mockResolvedValue();
        const execute = jest
            .fn()
            .mockResolvedValueOnce({
                rows: [{ TEMPERATURA: 24, HUMEDAD: 60 }],
            })
            .mockResolvedValueOnce({
                outBinds: { out_msg: "No se requirió riego" },
            });

        oracledb.getConnection.mockResolvedValue({ execute, close });

        const resp = await verificarCondiciones(20);

        expect(mqttService.enviarComandoFisicoRiego).not.toHaveBeenCalled();
        expect(resp.ok).toBe(true);
        expect(resp.mensaje).toContain("No se requirió riego");
        expect(resp.mensaje).toContain("24°C / 60%");
        expect(close).toHaveBeenCalled();
    });

    test("maneja errores y retorna mensaje genérico", async () => {
        oracledb.getConnection.mockRejectedValue(new Error("Oracle down"));

        const resp = await verificarCondiciones(99);

        expect(resp).toEqual({
            ok: false,
            mensaje: "Error al ejecutar la verificación.",
        });
        expect(mqttService.enviarComandoFisicoRiego).not.toHaveBeenCalled();
    });
});
