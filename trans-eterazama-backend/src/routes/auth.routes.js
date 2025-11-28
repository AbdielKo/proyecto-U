// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController'); 

// Ruta para registrar un nuevo usuario
router.post('/register', AuthController.register);

// Ruta para iniciar sesión (DEBE ESTAR PRESENTE)
router.post('/login', AuthController.login); // <-- ¡Asegúrate de que esta línea exista!

module.exports = router;