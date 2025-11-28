// src/controllers/ReporteController.js

const sequelize = require('../config/db.config');
const { QueryTypes } = require('sequelize');

// GET /api/reportes/ocupacion
// Genera un reporte detallado de la ocupación por horario.
exports.getOccupancyReport = async (req, res) => {
    try {
        const report = await sequelize.query(`
            SELECT
                H.id AS horarioId,
                R.origen,
                R.destino,
                H.hora_salida,
                H.dia_semana,
                H.capacidad_asientos AS capacidad_total,
                -- Cuenta cuántos asientos tienen una reserva 'Pagado'
                SUM(CASE WHEN Res.estado_pago = 'Pagado' THEN 1 ELSE 0 END) AS asientos_pagados,
                -- Calcula el porcentaje de ocupación
                (SUM(CASE WHEN Res.estado_pago = 'Pagado' THEN 1 ELSE 0 END) * 100.0) / H.capacidad_asientos AS porcentaje_ocupacion
            FROM Horarios AS H
            -- Necesitamos la Ruta para Origen/Destino
            JOIN Rutas AS R ON H.rutaId = R.id
            -- Necesitamos los Asientos para el conteo de reservas
            JOIN Asientos AS A ON H.id = A.horarioId
            -- LEFT JOIN a Reservas para incluir horarios que aún no tienen reservas
            LEFT JOIN Reservas AS Res ON A.id = Res.asientoId
            GROUP BY H.id, R.origen, R.destino, H.hora_salida, H.dia_semana, H.capacidad_asientos
            ORDER BY H.dia_semana, H.hora_salida;
        `, {
            type: QueryTypes.SELECT
        });

        res.status(200).json(report);
    } catch (error) {
        console.error('Error al generar reporte de ocupación:', error);
        res.status(500).json({ message: 'Error al generar reporte de ocupación', error: error.message });
    }
};