// Importaciones necesarias
const { response } = require("express"); // Objeto de Express para manejar respuestas
const bcryptjs = require("bcryptjs"); // Librería para encriptar y comparar contraseñas

const Usuario = require("../models/usuario"); // Modelo Usuario para interactuar con la base de datos

const { generarJWT } = require("../helpers/generar-jwt"); // Helper para generar tokens JWT
const { googleVerify } = require("../helpers/google-verify"); // Helper para verificar tokens de Google

// Controlador para el inicio de sesión
const login = async (req, res = response) => {
  const { correo, password } = req.body; // Extrae el correo y la contraseña del cuerpo de la solicitud

  try {
    // Verificar si el correo existe
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - correo", // Error si el correo no existe
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - estado: false", // Error si el usuario está inactivo
      });
    }

    // Verificar la contraseña
    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - password", // Error si la contraseña no coincide
      });
    }

    // Generar el JWT
    const token = await generarJWT(usuario.id);

    // Respuesta exitosa
    res.json({
      usuario,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Hable con el administrador", // Error genérico del servidor
    });
  }
};

// Controlador para el inicio de sesión con Google
const googleSignin = async (req, res = response) => {
  const { id_token } = req.body; // Extrae el token de Google del cuerpo de la solicitud

  try {
    // Verificar el token de Google y obtener los datos del usuario
    const { correo, nombre, img } = await googleVerify(id_token);

    let usuario = await Usuario.findOne({ correo });

    // Si el usuario no existe, se crea uno nuevo
    if (!usuario) {
      const data = {
        nombre,
        correo,
        password: ":P", // Contraseña temporal
        img,
        google: true, // Indica que el usuario fue creado con Google
      };

      usuario = new Usuario(data);
      await usuario.save();
    }

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(401).json({
        msg: "Hable con el administrador, usuario bloqueado", // Error si el usuario está bloqueado
      });
    }

    // Generar el JWT
    const token = await generarJWT(usuario.id);

    // Respuesta exitosa
    res.json({
      usuario,
      token,
    });
  } catch (error) {
    res.status(400).json({
      msg: "Token de Google no es válido", // Error si el token de Google no es válido
    });
  }
};

// Controlador para validar y renovar el token de un usuario
const validarTokenUsuario = async (req, res = response) => {
  // Generar un nuevo JWT
  const token = await generarJWT(req.usuario._id);

  // Respuesta exitosa con el usuario y el nuevo token
  res.json({
    usuario: req.usuario,
    token,
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  login, // Inicio de sesión
  googleSignin, // Inicio de sesión con Google
  validarTokenUsuario, // Validar y renovar el token de un usuario
};
