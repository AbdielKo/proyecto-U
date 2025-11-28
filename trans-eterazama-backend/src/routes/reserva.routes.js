// src/routes/reserva.routes.js

const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware'); 

// Rutas para pasajeros (Requieren Token)
router.get('/asientos-disponibles/:horarioId', verifyToken, ReservaController.getAvailableSeats);
router.post('/', verifyToken, ReservaController.createReserva);

// Rutas para administración (Requieren Token y rol Admin)
router.put('/confirmar-pago/:reservaId', verifyToken, isAdmin, ReservaController.confirmPayment); 
router.post('/venta-directa', verifyToken, isAdmin, ReservaController.createDirectSale); // <-- ¡AÑADIR!

module.exports = router;