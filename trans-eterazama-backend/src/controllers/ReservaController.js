// src/controllers/ReservaController.js

const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Asiento = require('../models/Asiento');
const Reserva = require('../models/Reserva');
const Horario = require('../models/Horario');
const Ruta = require('../models/Ruta'); // Necesario para referencias internas

// GET /api/reservas/asientos-disponibles/:horarioId
// Obtiene todos los asientos disponibles para un horario.
exports.getAvailableSeats = async (req, res) => {
    try {
        const { horarioId } = req.params;

        const asientos = await Asiento.findAll({
            where: { horarioId, estado: 'Disponible' },
            attributes: ['id', 'nombre_asiento', 'estado']
        });

        res.status(200).json(asientos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener asientos', error: error.message });
    }
};

// POST /api/reservas
// Crea una nueva reserva (estado inicial: Pendiente de Pago).
exports.createReserva = async (req, res) => {
    // ID del usuario que viene del JWT
    const usuarioId = req.usuario.id; 
    const { asientoId } = req.body; 
    
    const transaction = await sequelize.transaction();

    try {
        // 1. Verificar disponibilidad del asiento
        const asiento = await Asiento.findByPk(asientoId, { transaction });

        if (!asiento || asiento.estado !== 'Disponible') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Asiento no disponible o no existe.' });
        }
        
        // 2. BUSCAR EL HORARIO ASOCIADO
        const horario = await Horario.findByPk(asiento.horarioId, { transaction });

        if (!horario) {
             await transaction.rollback();
             return res.status(404).json({ message: 'Horario asociado al asiento no encontrado.' });
        }

        // 3. BUSCAR EL PRECIO DE LA RUTA MEDIANTE SQL CRUDA ROBUSTA
        // Se utiliza CAST para asegurar que el driver devuelva el DECIMAL como un número utilizable
        const rutaData = await sequelize.query(
            'SELECT CAST(precio_base AS DECIMAL(10,2)) AS precio_base FROM Rutas WHERE id = ?',
            {
                replacements: [horario.rutaId],
                type: QueryTypes.SELECT, 
                transaction
            }
        );

        if (!rutaData || rutaData.length === 0 || !rutaData[0].precio_base) {
             await transaction.rollback();
             return res.status(404).json({ message: 'No se pudo obtener el precio base de la Ruta.' });
        }
        
        const precio_final = rutaData[0].precio_base; 

        // 4. Crear la Reserva
        const nuevaReserva = await Reserva.create({
            usuarioId,
            asientoId,
            precio_final, 
            estado_pago: 'Pendiente', // Inicia como pendiente
        }, { transaction });

        // 5. Marcar el asiento como 'Reservado'
        await asiento.update({ estado: 'Reservado' }, { transaction });

        // 6. Commit de la Transacción
        await transaction.commit();

        res.status(201).json({ 
            message: 'Reserva creada con éxito. Precio a pagar: ' + precio_final, 
            reserva: nuevaReserva 
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error al crear la reserva:', error);
        res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
    }
};

// PUT /api/reservas/confirmar-pago/:reservaId
// Simula la confirmación de pago. Solo para Admin/Sistema.
exports.confirmPayment = async (req, res) => {
    const { reservaId } = req.params;

    try {
        // Solo actualiza si el estado es 'Pendiente'
        const [updated] = await Reserva.update(
            { estado_pago: 'Pagado' }, 
            { where: { id: reservaId, estado_pago: 'Pendiente' } }
        );

        if (updated) {
            const reservaPagada = await Reserva.findByPk(reservaId);
            return res.status(200).json({ 
                message: 'Pago confirmado y reserva completada.', 
                reserva: reservaPagada
            });
        }
        
        res.status(404).json({ message: 'Reserva no encontrada o el pago ya fue procesado.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al confirmar el pago', error: error.message });
    }
};
exports.createDirectSale = async (req, res) => {
    // El ID del usuario que vende (Admin o Vendedor)
    const usuarioId = req.usuario.id; 
    const { asientoId, nombre_pasajero, documento_pasajero } = req.body; 
    
    const transaction = await sequelize.transaction();

    try {
        // 1. Verificar disponibilidad del asiento
        const asiento = await Asiento.findByPk(asientoId, { transaction });

        if (!asiento || asiento.estado !== 'Disponible') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Asiento no disponible o no existe.' });
        }
        
        // 2. BUSCAR EL PRECIO (Usamos la lógica robusta ya implementada)
        const horario = await Horario.findByPk(asiento.horarioId, { transaction });

        if (!horario) {
             await transaction.rollback();
             return res.status(404).json({ message: 'Horario asociado al asiento no encontrado.' });
        }

        const rutaData = await sequelize.query(
            'SELECT CAST(precio_base AS DECIMAL(10,2)) AS precio_base FROM Rutas WHERE id = ?',
            {
                replacements: [horario.rutaId],
                type: QueryTypes.SELECT, 
                transaction
            }
        );

        if (!rutaData || rutaData.length === 0 || !rutaData[0].precio_base) {
             await transaction.rollback();
             return res.status(404).json({ message: 'No se pudo obtener el precio base de la Ruta.' });
        }
        
        const precio_final = rutaData[0].precio_base; 

        // 3. Crear la Reserva (Venta Directa)
        const nuevaReserva = await Reserva.create({
            usuarioId, // ID del Admin/Vendedor que registra la venta
            asientoId,
            precio_final, 
            estado_pago: 'Pagado', // <-- VENTA DIRECTA: PAGO INSTANTÁNEO
            // Campos adicionales para el pasajero (si se necesita registrar quién compró en ventanilla)
            nombre_pasajero,
            documento_pasajero,
        }, { transaction });

        // 4. Marcar el asiento como 'Reservado'
        await asiento.update({ estado: 'Reservado' }, { transaction });

        // 5. Commit de la Transacción
        await transaction.commit();

        res.status(201).json({ 
            message: 'Venta directa registrada con éxito. Boleto emitido.', 
            venta: nuevaReserva 
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error al crear la venta directa:', error);
        res.status(500).json({ message: 'Error al crear la venta directa', error: error.message });
    }
};