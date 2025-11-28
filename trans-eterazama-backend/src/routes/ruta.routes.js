// src/routes/ruta.routes.js

const express = require('express');
const router = express.Router();
const RutaController = require('../controllers/RutaController');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware'); // <-- Importar Middlewares

// Rutas Públicas (Cualquier usuario o pasajero puede ver las rutas)
router.get('/', RutaController.getAllRutas);

// Rutas Protegidas (Solo para Administradores)
router.post('/', verifyToken, isAdmin, RutaController.createRuta); // Crear requiere Admin
router.put('/:id', verifyToken, isAdmin, RutaController.updateRuta); // Actualizar requiere Admin
router.delete('/:id', verifyToken, isAdmin, RutaController.deleteRuta); // Eliminar requiere Admin

module.exports = router;