// src/controllers/RutaController.js

const Ruta = require('../models/Ruta');


// 1. Obtener todas las rutas (GET /api/rutas)
exports.getAllRutas = async (req, res) => {
    try {
        const rutas = await Ruta.findAll();
        res.status(200).json(rutas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener rutas', error: error.message });
    }
};

// 2. Crear una nueva ruta (POST /api/rutas)
exports.createRuta = async (req, res) => {
    try {
        const nuevaRuta = await Ruta.create(req.body);
        res.status(201).json({ message: 'Ruta creada con éxito', ruta: nuevaRuta });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la ruta', error: error.message });
    }
};

// 3. Actualizar una ruta (PUT /api/rutas/:id)
exports.updateRuta = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Ruta.update(req.body, { where: { id: id } });

        if (updated) {
            const updatedRuta = await Ruta.findByPk(id);
            return res.status(200).json({ message: 'Ruta actualizada con éxito', ruta: updatedRuta });
        }
        throw new Error('Ruta no encontrada');
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la ruta', error: error.message });
    }
};

// 4. Eliminar una ruta (DELETE /api/rutas/:id)
exports.deleteRuta = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Ruta.destroy({ where: { id: id } });

        if (deleted) {
            return res.status(204).send(); // 204 No Content para eliminación exitosa
        }
        throw new Error('Ruta no encontrada');
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la ruta', error: error.message });
    }
};