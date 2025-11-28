// src/app.js (Verifica que tu app.js sea similar a esto)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importar la conexión y todos los modelos
const sequelize = require('./config/db.config'); 
const Usuario = require('./models/Usuario'); 
const Ruta = require('./models/Ruta'); 
const Horario = require('./models/Horario'); 
const Asiento = require('./models/Asiento'); 
const Reserva = require('./models/Reserva');

// 2. Configurar las Asociaciones (¡Después de importar los modelos!)
require('./models/associations'); 

// 3. Importar las rutas
const authRoutes = require('./routes/auth.routes');
const rutaRoutes = require('./routes/ruta.routes');
const horarioRoutes = require('./routes/horario.routes');
const reservaRoutes = require('./routes/reserva.routes');
const reporteRoutes = require('./routes/reporte.routes'); // <-- ¡NUEVA IMPORTACIÓN!

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

// 4. Registrar las Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/rutas', rutaRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/reportes', reporteRoutes); // <-- ¡NUEVO REGISTRO!

// Sincronizar modelos con la base de datos e iniciar el servidor
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida.');

        // Se quita {alter: true} para evitar el error de "Too many keys"
        await sequelize.sync(); 
        
        console.log('✅ Base de datos (MySQL) sincronizada. Tablas creadas/actualizadas.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Error al iniciar el servidor o sincronizar la BD:', err);
    }
}

startServer();