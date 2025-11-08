const oracledb = require('oracledb');

jest.mock('oracledb', () => ({
    OUT_FORMAT_OBJECT: 1,
    BIND_OUT: 3003,
    NUMBER: 2010,
    getConnection: jest.fn(),
}));

jest.mock('mqtt', () => {
    const handlers = {};
    const client = {
        connected: true,
        publish: jest.fn(),
        subscribe: jest.fn((_topic, cb) => cb && cb(null)),
        on: jest.fn((event, handler) => {
            handlers[event] = handler;
        }),
    };

    return {
        connect: jest.fn(() => client),
        __client: client,
        __handlers: handlers,
    };
});

const {
    initMQTT,
    enviarComandoRiego,
    enviarComandoFisicoRiego,
    ensureSensorForPlanta,
    setSensorForPlanta,
} = require('../services/mqttService');

describe('ensureSensorForPlanta', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('devuelve ID_SENSOR existente si ya hay sensor', async () => {
        const mockConn = {
            execute: jest.fn().mockResolvedValueOnce({
                rows: [{ ID_SENSOR: 42 }],
            }),
            close: jest.fn().mockResolvedValue(),
        };

        oracledb.getConnection.mockResolvedValue(mockConn);

        const id = await ensureSensorForPlanta(10);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConn.execute).toHaveBeenCalledTimes(1);
        expect(id).toBe(42);
        expect(mockConn.close).toHaveBeenCalledTimes(1);
    });

    test('inserta y devuelve nuevo ID_SENSOR si no existe uno previo', async () => {
        const mockConn = {
            execute: jest
                .fn()
                // select sin filas
                .mockResolvedValueOnce({ rows: [] })
                // insert con RETURNING
                .mockResolvedValueOnce({
                    outBinds: { out_id: [77] },
                }),
            close: jest.fn().mockResolvedValue(),
        };

        oracledb.getConnection.mockResolvedValue(mockConn);

        const id = await ensureSensorForPlanta(20);

        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConn.execute).toHaveBeenCalledTimes(2);
        expect(id).toBe(77);
        expect(mockConn.close).toHaveBeenCalledTimes(1);
    });
});

describe('enviarComandoRiego', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('devuelve ok:false si MQTT no está conectado o no inicializado', async () => {
        const res = await enviarComandoRiego();
        expect(res.ok).toBe(false);
    });

    test('devuelve ok:false si no hay sensor activo', async () => {
        // MQTT conectado pero sin CURRENT_SENSOR_ID
        const mqttMock = require('mqtt');
        mqttMock.__client.connected = true;

        // initMQTT setea client internamente
        initMQTT('mqtt://broker', {}, 'plantas/test');

        const res = await enviarComandoRiego();
        expect(res.ok).toBe(false);
    });
});

describe('enviarComandoFisicoRiego', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('devuelve ok:false si MQTT no está conectado', async () => {
        const mqttMock = require('mqtt');
        mqttMock.__client.connected = false;

        const res = await enviarComandoFisicoRiego();
        expect(res.ok).toBe(false);
    });

    test('publica REGAR cuando MQTT está conectado', async () => {
        const mqttMock = require('mqtt');
        mqttMock.__client.connected = true;

        initMQTT('mqtt://broker', {}, 'plantas/test');

        const res = await enviarComandoFisicoRiego();

        expect(res.ok).toBe(true);
        expect(mqttMock.__client.publish).toHaveBeenCalledWith(
            'plantas/regar',
            'REGAR'
        );
    });
});

describe('setSensorForPlanta', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('setea sensor activo usando ensureSensorForPlanta', async () => {
        const mockConn = {
            execute: jest.fn().mockResolvedValueOnce({
                rows: [{ ID_SENSOR: 99 }],
            }),
            close: jest.fn().mockResolvedValue(),
        };

        oracledb.getConnection.mockResolvedValue(mockConn);

        const id = await setSensorForPlanta(123);

        expect(id).toBe(99);
        expect(oracledb.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConn.close).toHaveBeenCalledTimes(1);
    });
});
