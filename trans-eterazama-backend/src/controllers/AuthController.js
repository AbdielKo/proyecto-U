// src/controllers/AuthController.js

const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 1. Importar jsonwebtoken

/**
 * Registra un nuevo usuario (Pasajero)
 */
exports.register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // 1. Verificar si el usuario ya existe
        let usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        // 2. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

// ...
        // 3. Crear el nuevo usuario en la base de datos
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password_hash: hashedPassword,
            rol: 'Pasajero', // <--- DE VUELTA A 'Pasajero'
        });
// ...

        res.status(201).json({ 
            message: 'Registro exitoso. ¡Bienvenido!',
            usuarioId: nuevoUsuario.id
        });

    } catch (error) {
        console.error('Error durante el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }
};

/**
 * Inicia sesión de un usuario y genera un JWT
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario por email
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ message: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña encriptada con la ingresada
        const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Generar JSON Web Token (JWT)
        const payload = {
            id: usuario.id,
            rol: usuario.rol,
            email: usuario.email,
        };

        // El token se firma usando la clave secreta del .env
        const token = jwt.sign(
            payload, 
            process.env.SECRET_KEY, 
            { expiresIn: '1h' } // Token válido por 1 hora
        );

        res.status(200).json({ 
            message: 'Inicio de sesión exitoso',
            token: token,
            rol: usuario.rol 
        });

    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }
};