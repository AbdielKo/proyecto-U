// src/models/Usuario.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config'); // Importa la conexión

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Validación automática de formato de email
    }
  },
  password_hash: { // Almacenaremos el hash de la contraseña (NUNCA la contraseña plana)
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: { // Permite diferenciar entre 'Pasajero' y 'Admin'
    type: DataTypes.ENUM('Pasajero', 'Admin'),
    defaultValue: 'Pasajero',
    allowNull: false,
  },
}, {
  // Opciones de Sequelize
  tableName: 'Usuarios',
  timestamps: true, // Crea automáticamente campos 'createdAt' y 'updatedAt'
});

module.exports = Usuario;