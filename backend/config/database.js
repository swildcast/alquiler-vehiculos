const { Sequelize } = require('sequelize');

// Reemplaza 'tu_clave_postgres' por la contraseña que le pusiste al usuario postgres en la terminal
const sequelize = new Sequelize('alquileres_db', 'postgres', 'Buzz041731', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false // Mantiene la consola limpia de logs SQL
});

module.exports = sequelize;