// src/controllers/HorarioController.js
const sequelize = require('../config/db.config'); // <-- ¡LÍNEA FALTANTE!
const { QueryTypes } = require('sequelize'); // (Esta ya debe estar)

const Horario = require('../models/Horario');
const Ruta = require('../models/Ruta'); 
const Asiento = require('../models/Asiento');
const Reserva = require('../models/Reserva');


// POST /api/horarios
exports.createHorario = async (req, res) => {
    try {
        const { rutaId, hora_salida, dia_semana, tipo_vehiculo, capacidad_asientos } = req.body;

        // 1. Verificar si la Ruta existe
        const ruta = await Ruta.findByPk(rutaId);
        if (!ruta) {
            return res.status(404).json({ message: 'La Ruta especificada no existe.' });
        }

        // 2. Crear el nuevo Horario
        const nuevoHorario = await Horario.create({
            rutaId,
            hora_salida,
            dia_semana,
            tipo_vehiculo,
            capacidad_asientos
        });
        
        // 3. GENERACIÓN AUTOMÁTICA DE ASIENTOS 
        const asientosData = [];
        for (let i = 1; i <= capacidad_asientos; i++) {
            asientosData.push({
                horarioId: nuevoHorario.id,
                nombre_asiento: `A${i}`, // A1, A2, A3...
                estado: 'Disponible'
            });
        }
        await Asiento.bulkCreate(asientosData); // Inserción masiva

        res.status(201).json({ 
            message: 'Horario y asientos creados con éxito', 
            horario: nuevoHorario 
        });

    } catch (error) {
        // ... (el resto del catch)
        res.status(500).json({ message: 'Error al crear el horario', error: error.message });
    }
};

// GET /api/horarios/:rutaId
exports.getHorariosByRuta = async (req, res) => {
    try {
        const { rutaId } = req.params;
        
        // Incluir la información de la Ruta asociada
        const horarios = await Horario.findAll({
            where: { rutaId },
            include: [{ model: Ruta, attributes: ['origen', 'destino'] }]
        });

        if (horarios.length === 0) {
             return res.status(404).json({ message: 'No se encontraron horarios para esta ruta.' });
        }

        res.status(200).json(horarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener horarios', error: error.message });
    }
};

// PUT y DELETE (Implementación rápida para CRUD completo)

// PUT /api/horarios/:id
exports.updateHorario = async (req, res) => {
    try {
        const [updated] = await Horario.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedHorario = await Horario.findByPk(req.params.id);
            return res.status(200).json({ message: 'Horario actualizado', horario: updatedHorario });
        }
        res.status(404).json({ message: 'Horario no encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// DELETE /api/horarios/:id
exports.deleteHorario = async (req, res) => {
    try {
        const deleted = await Horario.destroy({ where: { id: req.params.id } });
        if (deleted) {
            return res.status(204).send();
        }
        res.status(404).json({ message: 'Horario no encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar', error: error.message });
    }
};
exports.dispatchSchedule = async (req, res) => {
    const { horarioId } = req.params;
    
    // Es crucial que 'sequelize', 'Horario', 'Asiento' y 'Reserva' estén importados
    // al inicio del archivo.
    const transaction = await sequelize.transaction();

    try {
        const horario = await Horario.findByPk(horarioId, { transaction });

        if (!horario) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Horario no encontrado.' });
        }

        if (horario.estado !== 'Activo') {
            await transaction.rollback();
            return res.status(400).json({ message: `El horario ya fue despachado o está inactivo (${horario.estado}).` });
        }

        // 1. Marcar el horario como 'Despachado' (Bloquea futuras ventas/reservas)
        await horario.update({ estado: 'Despachado' }, { transaction });

        // 2. CRUCIAL: Marcar todos los asientos de este horario como 'Ocupado'
        // Esto previene futuras reservas/ventas y refleja que el bus partió.
        await Asiento.update(
            { estado: 'Ocupado' }, // Usamos 'Ocupado' para reflejar que el bus está en ruta
            { 
                where: { horarioId: horarioId },
                transaction
            }
        );

        // 3. LIMPIEZA: Cancelar las Reservas que quedaron PENDIENTES
        // Ya que el bus partió, esas reservas ya no son válidas.
        
        // A. Obtener IDs de Asientos afectados
        const asientosDelHorario = await Asiento.findAll({
             where: { horarioId: horarioId },
             attributes: ['id']
        });
        const asientoIds = asientosDelHorario.map(a => a.id);
        
        // B. Cancelar las reservas pendientes asociadas a esos asientos
        await Reserva.update(
            { estado_pago: 'Cancelado' },
            { 
                where: { 
                    asientoId: asientoIds,
                    estado_pago: 'Pendiente'
                },
                transaction
            }
        );
        
        await transaction.commit();

        res.status(200).json({ 
            message: `Horario ${horarioId} despachado. La venta ha sido cerrada y los asientos bloqueados.`,
            horario
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error al despachar el horario:', error);
        res.status(500).json({ message: 'Error al despachar el horario', error: error.message });
    }
};