// src/models/Horario.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Ruta = require('./Ruta'); // Importar el modelo Ruta

const Horario = sequelize.define('Horario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    estado: {
        type: DataTypes.ENUM('Activo', 'Despachado', 'Cancelado'),
        defaultValue: 'Activo', // Estado inicial
        allowNull: false
    },
  hora_salida: { // La hora exacta de salida (ej: 07:00:00)
    type: DataTypes.TIME, 
    allowNull: false,
  },
  dia_semana: { // Días que opera (ej: Lunes, Martes, Todos)
    type: DataTypes.STRING(50), 
    allowNull: false,
    defaultValue: 'Todos',
  },
  tipo_vehiculo: { // Búfalo, Trufi, etc.
    type: DataTypes.ENUM('Búfalo', 'Trufi', 'Otro'),
    allowNull: false,
  },
  capacidad_asientos: { // Capacidad total del vehículo
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Horarios',
  timestamps: true,
});

// Relación: Un Horario pertenece a una Ruta


module.exports = Horario;