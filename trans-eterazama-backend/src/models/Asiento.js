// src/models/Asiento.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Horario = require('./Horario');

const Asiento = sequelize.define('Asiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_asiento: { // Ej: A1, B1, 15, 20
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('Disponible', 'Reservado', 'Ocupado'),
    allowNull: false,
    defaultValue: 'Disponible',
  },
  // La clave foránea 'horarioId' se añade automáticamente por la relación
}, {
  tableName: 'Asientos',
  timestamps: true,
});

// Relación: Un Asiento pertenece a un Horario
Asiento.belongsTo(Horario, { foreignKey: 'horarioId' });
Horario.hasMany(Asiento, { foreignKey: 'horarioId' });

module.exports = Asiento;