require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { testConnection } = require('./config/db');

const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Test conexión Oracle al inicio
testConnection();

// Inicializar MQTT (solo si existe el módulo)
let mqttService;
try {
  mqttService = require("./services/mqttService");
  console.log(" Módulo MQTT cargado correctamente.");
} catch (err) {
  console.warn(" Módulo MQTT no encontrado, se omitirá la funcionalidad MQTT.");
}


// Rutas API
app.use('/api', require('./routes/auth.routes'));
app.use('/api', require('./routes/contact.routes'));
app.use('/api', require('./routes/mqtt.routes'));
app.use('/api', require('./routes/plantas.routes'));
app.use('/api', require('./routes/cuidados.routes'));
app.use('/api', require('./routes/admin.routes'));
app.use('/api', require('./routes/pkgCentral.routes'));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Errores globales
process.on('unhandledRejection', (reason) => {
  console.error('Rechazo de promesa no manejado:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

// Inicio servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
