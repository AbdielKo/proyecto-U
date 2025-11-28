// src/models/Ruta.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Ruta = sequelize.define('Ruta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  origen: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  destino: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  precio_base: { // El precio mínimo de un pasaje en esta ruta
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  duracion_estimada: { // En minutos u horas
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'Rutas',
  timestamps: true,
});

module.exports = Ruta;