const oracledb = require('oracledb');

jest.mock('oracledb', () => ({
    OUT_FORMAT_OBJECT: 1,
    BIND_OUT: 3003,
    NUMBER: 2010,
    getConnection: jest.fn(),
}));

// Importa solo lo que realmente exporta cuidadosService
const { crearCuidado } = require('../services/cuidadosService');

describe('crearCuidado', () => {
    let mockConn;

    beforeEach(() => {
        mockConn = {
            execute: jest.fn(),
            close: jest.fn().mockResolvedValue(),
        };
        oracledb.getConnection.mockResolvedValue(mockConn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('inserta cuidado con ID_RIEGO cuando existe riego previo', async () => {
        // Secuencia esperada dentro de crearCuidado:
        // 1) SELECT sensor
        // 2) SELECT lectura
        // 3) SELECT riego
        // 4) INSERT historial_cuidados

        mockConn.execute
            // sensor
            .mockResolvedValueOnce({ rows: [{ ID_SENSOR: 10 }] })
            // lectura
            .mockResolvedValueOnce({ rows: [{ ID_LECTURA: 99 }] })
            // riego
            .mockResolvedValueOnce({ rows: [{ ID_RIEGO: 5 }] })
            // insert cuidado
            .mockResolvedValueOnce({
                rowsAffected: 1,
                outBinds: { id_out: [123] },
            });

        const payload = {
            id_planta_usuario: 1,
            fecha: '2025-11-08',
            tipo_cuidado: 'Poda',
            detalle: 'Poda ligera',
        };

        const res = await crearCuidado(payload);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);

        // 4ta llamada = INSERT
        const insertCall = mockConn.execute.mock.calls[3];
        const insertSql = insertCall[0];
        const bindVars = insertCall[1];
        const options = insertCall[2];

        expect(insertSql).toContain('INSERT INTO TIERRA_EN_CALMA.HISTORIAL_CUIDADOS');
        expect(bindVars.id_pu).toBe(payload.id_planta_usuario);
        expect(bindVars.id_riego).toBe(5);
        expect(bindVars.fecha).toBe(payload.fecha);
        expect(bindVars.tipo_cuidado).toBe(payload.tipo_cuidado);
        expect(bindVars.detalle).toBe(payload.detalle);
        expect(options).toEqual({ autoCommit: true });

        expect(res).toEqual({ id_cuidado: 123, id_riego: 5 });
        expect(mockConn.close).toHaveBeenCalledTimes(1);
    });

    test('inserta cuidado con ID_RIEGO = null cuando no hay riego previo', async () => {
        // Caso: helper interno devuelve null -> solo insert con id_riego = null
        mockConn.execute
            // sin sensor => getUltimoIdRiegoPorPlantaUsuario => null
            .mockResolvedValueOnce({ rows: [] })
            // insert cuidado
            .mockResolvedValueOnce({
                rowsAffected: 1,
                outBinds: { id_out: [456] },
            });

        const payload = {
            id_planta_usuario: 2,
            fecha: '2025-11-08',
            tipo_cuidado: 'Fertilización',
            detalle: '',
        };

        const res = await crearCuidado(payload);

        // 2da llamada = INSERT
        const insertCall = mockConn.execute.mock.calls[1];
        const bindVars = insertCall[1];

        expect(bindVars.id_pu).toBe(payload.id_planta_usuario);
        expect(bindVars.id_riego).toBeNull();
        expect(bindVars.detalle).toBeNull();
        expect(res).toEqual({ id_cuidado: 456, id_riego: null });
        expect(mockConn.close).toHaveBeenCalledTimes(1);
    });

    test('si algo falla antes del insert, cierra conexión igual', async () => {
        mockConn.execute.mockRejectedValueOnce(new Error('Falla en SELECT'));

        await expect(
            crearCuidado({
                id_planta_usuario: 1,
                fecha: '2025-11-08',
                tipo_cuidado: 'Riego',
                detalle: 'Test',
            })
        ).rejects.toThrow('Falla en SELECT');

        expect(mockConn.close).toHaveBeenCalledTimes(1);
    });
});
