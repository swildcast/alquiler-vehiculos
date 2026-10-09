const express = require('express');
const sequelize = require('./config/database');

// Importamos los modelos para que Sequelize los registre
require('./models/Vehiculo');
require('./models/Cliente');
require('./models/Alquiler');

// Importamos las rutas
const vehiculosRoutes = require('./routes/vehiculosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const alquileresRoutes = require('./routes/alquileresRoutes');

const app = express();

app.use(express.json());

// Probamos la conexión y sincronizamos las tablas con PostgreSQL
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión exitosa a PostgreSQL');
    return sequelize.sync({ alter: true }); // Crea o actualiza las tablas en la BD
  })
  .then(() => {
    console.log('✅ Tablas sincronizadas correctamente en PostgreSQL');
  })
  .catch(error => {
    console.error('❌ Error al conectar a PostgreSQL:', error);
  });

// Rutas
app.use('/vehiculos', vehiculosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/alquileres', alquileresRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});