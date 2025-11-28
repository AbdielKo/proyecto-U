// src/models/associations.js

const Usuario = require('./Usuario');
const Ruta = require('./Ruta');
const Horario = require('./Horario');
const Asiento = require('./Asiento');
const Reserva = require('./Reserva');

// --- RUTAS Y HORARIOS ---
Horario.belongsTo(Ruta, { foreignKey: 'rutaId' });
Ruta.hasMany(Horario, { foreignKey: 'rutaId' });

// --- ASIENTOS ---
Asiento.belongsTo(Horario, { foreignKey: 'horarioId' });
Horario.hasMany(Asiento, { foreignKey: 'horarioId' });

// --- RESERVAS ---
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Asiento, { foreignKey: 'asientoId' });
Asiento.hasOne(Reserva, { foreignKey: 'asientoId' });