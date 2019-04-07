const jwt = require('jsonwebtoken');

/**
 * VERIFICAR TOKEN
 */

let verificaToken = (req, res, next) => {
    let token = req.get('token'); // leer header
    // verificar si el token es igual
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            // No autorizado
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();
    });

};

/**
 * VERIFICA ADMIN ROLE
 */

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role == "ADMIN_ROLE") {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es Administrador'
            }
        })
    }


};

module.exports = {
    verificaToken,
    verificaAdminRole
};