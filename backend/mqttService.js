const mqtt = require("mqtt");
const oracledb = require("oracledb");

let client;
let ultimoDato = "Esperando datos...";
let historial = [];

const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASS,
    connectString: process.env.ORACLE_CONN,
};

// ID del sensor (por ahora fijo)
const ID_SENSOR = 5;

// Control del tiempo de guardado
let ultimoGuardado = 0;
let guardando = false;
const INTERVALO_GUARDADO = 300 * 1000;

/**
 * Inicializa la conexión con el broker MQTT
 * Se suscribe al tópico y gestiona la recepción de mensaje
 * @param {string} brokerUrl 
 * @param {object} options 
 * @param {string} topic 
 */
function initMQTT(brokerUrl, options, topic) {
    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
        client.subscribe(topic, (err) => {
            if (err) console.error("Error al suscribirse al tópico:", err.message);
        });
    });

    client.on("message", async (receivedTopic, message) => {
        const dato = message.toString();
        ultimoDato = dato;
        historial.push(dato);

        const ahora = Date.now();

        // Controla que se guarde solo una lectura cada 5 min
        if (guardando) return;

        if (ahora - ultimoGuardado >= INTERVALO_GUARDADO) {
            guardando = true;
            await procesarDatoMQTT(dato);
            ultimoGuardado = Date.now();
            guardando = false;
        }
    });

    client.on("error", (err) => {
        console.error("Error en la conexión MQTT:", err.message);
    });
}

/**
 * Procesa los mensajes recibidos desde el broker MQTT y se guardan en oracle
 * @param {string} dato - Mensaje recibido del tópico MQTT
 */
async function procesarDatoMQTT(dato) {
    try {
        const regex = /T:(\d+\.?\d*),H:(\d+\.?\d*),Suelo:(\d+\.?\d*)%/;
        const match = dato.match(regex);

        if (!match) return;

        const temperatura = Number(parseFloat(match[1]).toFixed(2));
        const humedad = Number(parseFloat(match[3]).toFixed(2));

        if (isNaN(temperatura) || isNaN(humedad)) return;

        const fechaHora = new Date();

        const conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `
            INSERT INTO TIERRA_EN_CALMA.LECTURA_SENSORES
            (ID_SENSOR, TEMPERATURA, HUMEDAD, FECHA_HORA)
            VALUES (:id_sensor, :temperatura, :humedad, :fecha)
            `,
            {
                id_sensor: ID_SENSOR,
                temperatura,
                humedad,
                fecha: fechaHora,
            },
            { autoCommit: true }
        );
        await conn.close();
    } catch (err) {
        console.error("Error al insertar lectura MQTT:", err.message);
    }
}

/**
 * último dato recibido del broker MQTT
 * @returns {string} Último valor de mensaje MQTT recibido
 */
function getUltimoDato() {
    return ultimoDato;
}

/**
 *  historial completo de mensajes recibidos desde el broker
 * @returns {Array<string>} 
 */
function getHistorial() {
    return historial;
}

/**
 * Envía un comando al tópico MQTT utilizado para activar el riego
 * @param {string} [topic="plantas/regar"] - Tópico al que se publicará el comando de riego
 * @returns {boolean} 
 */
function enviarComandoRiego(topic = "plantas/regar") {
    if (!client || !client.connected) {
        console.error("No hay conexión MQTT activa.");
        return false;
    }
    client.publish(topic, "REGAR");
    return true;
}

module.exports = {
    initMQTT,
    getUltimoDato,
    getHistorial,
    enviarComandoRiego,
};
