// src/models/Reserva.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Usuario = require('./Usuario');
const Asiento = require('./Asiento');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha_reserva: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estado_pago: {
    type: DataTypes.ENUM('Pendiente', 'Pagado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente',
  },
  precio_final: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Las claves foráneas se añadirán automáticamente
}, {
  tableName: 'Reservas',
  timestamps: true,
});

// Relaciones:
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Asiento, { foreignKey: 'asientoId' });
Asiento.hasOne(Reserva, { foreignKey: 'asientoId' }); // Un asiento puede tener solo 1 reserva activa

module.exports = Reserva;