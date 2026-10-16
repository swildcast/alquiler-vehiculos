const express = require('express');
const cors = require('cors'); // 👈 1. Importar CORS arriba
const sequelize = require('./config/database');

// Importar rutas
const vehiculosRoutes = require('./routes/vehiculosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const alquileresRoutes = require('./routes/alquileresRoutes');

const app = express();

// --- MIDDLEWARES (SIEMPRE ANTES DE LAS RUTAS) ---
app.use(cors()); // 👈 2. Activar CORS aquí
app.use(express.json());

// --- RUTAS ---
app.use('/vehiculos', vehiculosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/alquileres', alquileresRoutes);

// Conexión y servidor
sequelize.sync().then(() => {
  console.log('✅ Tablas sincronizadas correctamente en PostgreSQL');
  app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
  });
}).catch(error => {
  console.error('Error al conectar a la base de datos:', error);
});