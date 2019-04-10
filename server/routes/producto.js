const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const _ = require('underscore');
const app = express();
let Producto = require('../models/producto');
let Categoria = require('../models/categoria');

/****************************************
 * Buscar Productos
 ****************************************
 * * 
 */

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });
});

/****************************************
 * Obtener todos los productos
 ****************************************
 * * Trae todos los productos
 * * Populate: usuario categoría
 * * Paginado
 */

app.get('/productos', verificaToken, (req, res) => {

    // parametros opcionales
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, "nombre procioUni descripcion disponible categoria usuario")
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    cantidad: conteo,
                    productos

                });
            })
        })
})

/****************************************
 * Obtener un producto por un ID
 ****************************************
 * * Populate: usuario categoría
 */

app.get('/productos/:prodId', verificaToken, (req, res) => {
    let prodId = req.params.prodId;
    Producto.findById(prodId)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: "No se encontro resultados"
                    }
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        })
})

/****************************************
 * Crear nuevo producto
 ****************************************
 * * Grabar el usuario
 * * Grabar una categoría del listado
 */

app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id

    });

    Categoria.findById(producto.categoria, (err, categoriaDB) => {
        if (err) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: "No se encontro resultados"
                }
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            })
        }

        // Si el id de categoria enviado existe en la colección de categorias
        producto.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
    })
})

/****************************************
 * Actualizar un producto
 ****************************************
 * * 
 */

app.put('/productos/:prodId', verificaToken, (req, res) => {
    let prodId = req.params.prodId;

    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(prodId, body, { new: true, runValidators: true, context: "query" })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        })
})

/****************************************
 * Borrar un producto
 ****************************************
 * * disponible = false
 * * Mensaje de salida = El producto a sido deshabilitado
 */

app.delete('/productos/:prodId', [verificaToken, verificaAdminRole], (req, res) => {
    let prodId = req.params.prodId;

    let cambiaEstado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(prodId, cambiaEstado, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            })
        }

        res.json({
            ok: true,
            message: 'El producto a sido deshabilitado',
            producto: productoDB
        });
    })
})




module.exports = app;