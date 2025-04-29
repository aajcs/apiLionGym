const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },

    rol: {
      type: String,
      required: true,
      default: "lectura",
      enum: ["superAdmin", "admin", "operador", "user", "lectura"],
    },

    acceso: {
      type: String,
      required: true,
      default: "ninguno",
      enum: ["limitado", "completo", "ninguno"],
    },
    estado: {
      type: String,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    /* google: {
        type: Boolean,
        default: false
    },*/
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UsuarioSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

module.exports = model("Usuario", UsuarioSchema);
