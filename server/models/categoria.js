const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "La descripción de la categoría es necesario"]
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario"
  }
});

// validando descripción única
categoriaSchema.plugin(uniqueValidator, {
  message: "{PATH} debe de ser única"
});

module.exports = mongoose.model("Categoria", categoriaSchema);
