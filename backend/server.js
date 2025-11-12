require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { testConnection } = require('./config/db');
const mqttService = require('./services/mqttService');

const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Test conexión Oracle al inicio
testConnection();

// Inicializar MQTT
mqttService.initMQTT(
  process.env.MQTT_BROKER,
  {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
  },
  process.env.MQTT_TOPIC
);

// Rutas API
app.use('/api', require('./routes/auth.routes'));
app.use('/api', require('./routes/contact.routes'));
app.use('/api', require('./routes/mqtt.routes'));
app.use('/api', require('./routes/plantas.routes'));
app.use('/api', require('./routes/cuidados.routes'));
app.use('/api', require('./routes/admin.routes'));
app.use('/api', require('./pkgCentral.routes'));

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
