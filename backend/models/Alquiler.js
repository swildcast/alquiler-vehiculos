const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Vehiculo = require('./Vehiculo');
const Cliente = require('./Cliente');

const Alquiler = sequelize.define('Alquiler', {
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dias: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Definimos las relaciones (un alquiler pertenece a un vehículo y a un cliente)
Alquiler.belongsTo(Vehiculo, { foreignKey: 'idVehiculo' });
Alquiler.belongsTo(Cliente, { foreignKey: 'idCliente' });

module.exports = Alquiler;