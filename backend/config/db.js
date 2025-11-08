const oracledb = require('oracledb');

const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASS,
    connectString: process.env.ORACLE_CONN,
};

async function testConnection() {
    console.log('Probando conexión a Oracle...');
    try {
        const conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute("SELECT 'Conexión OK' AS estado FROM DUAL");
        console.log(`Conexión exitosa a Oracle: ${result.rows[0][0]}`);
        await conn.close();
    } catch (err) {
        console.error('Error al conectar con Oracle al iniciar el servidor:');
        console.error(`Código: ${err.errorNum || err.code}`);
        console.error(`Mensaje: ${err.message}`);
    }
}

module.exports = {
    oracledb,
    dbConfig,
    testConnection,
};
