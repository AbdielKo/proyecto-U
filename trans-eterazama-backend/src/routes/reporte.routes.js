// src/routes/reporte.routes.js

const express = require('express');
const ReporteController = require('../controllers/ReporteController');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas protegidas por token y rol Admin
router.get('/ocupacion', verifyToken, isAdmin, ReporteController.getOccupancyReport);

module.exports = router;