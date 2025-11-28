// src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // 1. Obtener el token del encabezado (Header)
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    // Verificar si existe el token
    if (!token) {
        return res.status(403).json({ message: 'Se requiere un token para la autenticación.' });
    }

    try {
        // Limpiar el token si viene con el prefijo "Bearer "
        let tokenToVerify = token;
        if (token.startsWith('Bearer ')) {
            tokenToVerify = token.slice(7, token.length);
        }

        // 2. Verificar el token usando la clave secreta
        const decoded = jwt.verify(tokenToVerify, process.env.SECRET_KEY);
        
        // 3. Adjuntar el usuario decodificado a la solicitud (req.usuario)
        req.usuario = decoded; 
        
        next(); // Continuar con el controlador
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

/**
 * Middleware para verificar si el usuario es un Administrador
 */
exports.isAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};