// src/routes/horario.routes.js

const express = require('express');
const router = express.Router();
const HorarioController = require('../controllers/HorarioController');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas Públicas (para que el pasajero pueda buscar horarios)
router.get('/:rutaId', HorarioController.getHorariosByRuta);

// Rutas Protegidas (Solo para Administradores)
router.post('/', verifyToken, isAdmin, HorarioController.createHorario);
router.put('/:id', verifyToken, isAdmin, HorarioController.updateHorario);
router.delete('/:id', verifyToken, isAdmin, HorarioController.deleteHorario);
router.put('/despachar/:horarioId', verifyToken, isAdmin, HorarioController.dispatchSchedule); // <-- ¡AÑADIR!

module.exports = router;