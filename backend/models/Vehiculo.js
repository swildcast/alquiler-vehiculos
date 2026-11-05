const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehiculo = sequelize.define('Vehiculo', {
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Sedán'
  },
  transmision: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Automática'
  },
  pasajeros: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  combustible: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Gasolina'
  },
  maletas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  precioPorDia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  imagenUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = Vehiculo;
