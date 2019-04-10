const express = require("express");
let { verificaToken, verificaAdminRole } = require("../middlewares/autenticacion");
const _ = require("underscore");
let app = express();
let Categoria = require("../models/categoria");

// Obtener todas las categorias
// Mostrar todas las categorias
app.get("/categoria", verificaToken, (req, res) => {
  Categoria.find({}, "descripcion usuario")
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!categorias) {
        return res.status(400).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        categorias
      });
    });
});

// Mostrar una categoria por ID
app.get("/categoria/:catId", verificaToken, (req, res) => {
  //Categoria.findById(..);
  let catId = req.params.catId;
  Categoria.findById(catId, (err, categoriaDB) => {
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

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// Crear nueva categoria
app.post("/categoria", [verificaToken, verificaAdminRole], (req, res) => {
  // regresa la nueva categoria
  // req.usuario._id

  let body = req.body;
  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// Actualiza categoria
// Actualizar la descripcion
app.put("/categoria/:catId", [verificaToken, verificaAdminRole], (req, res) => {
  let catId = req.params.catId;

  // recepcionando solos los datos a actualizar
  let body = _.pick(req.body, ["descripcion"]);

  Categoria.findByIdAndUpdate(catId, body, { new: true, runValidators: true, context: "query" },
    (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        categoria: categoriaDB
      });
    }
  );
});

// Borrar categoria
app.delete("/categoria/:catId", [verificaToken, verificaAdminRole], (req, res) => {
  // Solo un administrador puede borrar categorìas
  // Categoria.findByIdAndRemove
  let catId = req.params.catId;

  Categoria.findByIdAndRemove(catId, (err, categoriaDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      })
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      })
    }

    res.json({
      ok: true,
      message: 'Categoría eliminada',
      categoria: categoriaDB
    });
  })


});

module.exports = app;
