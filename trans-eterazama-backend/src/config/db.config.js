// src/config/db.config.js (PARA MySQL)

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE, 
  process.env.DB_USER,     
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // <-- CAMBIO CLAVE
    // Ya no se necesita el bloque dialectOptions específico de MSSQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false, 
  }
);

module.exports = sequelize;