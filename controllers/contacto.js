// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Contacto = require("../models/contacto"); // Modelo Contacto para interactuar con la base de datos

// Opciones de población reutilizables para consultas
const populateOptions = [{ path: "idRefineria", select: "nombre" }]; // Relación con el modelo Refineria, seleccionando solo el campo "nombre"

// Controlador para obtener todos los contactos con población de referencias
const contactoGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo contactos no eliminados

  try {
    const [total, contactos] = await Promise.all([
      Contacto.countDocuments(query), // Cuenta el total de contactos
      Contacto.find(query).populate(populateOptions), // Obtiene los contactos con referencias pobladas
    ]);

    res.json({ total, contactos }); // Responde con el total y la lista de contactos
  } catch (err) {
    console.error("Error en contactoGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      }); // Responde con un error 400 si hay un problema con las referencias
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener los contactos.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un contacto específico por ID
const contactoGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contacto desde los parámetros de la URL

  try {
    const contacto = await Contacto.findOne({
      _id: id,
      estado: true,
      eliminado: false,
    }).populate(populateOptions); // Busca el contacto por ID y popula las referencias

    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" }); // Responde con un error 404 si no se encuentra el contacto
    }

    res.json(contacto); // Responde con los datos del contacto
  } catch (err) {
    console.error("Error en contactoGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contacto no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener el contacto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo contacto
const contactoPost = async (req = request, res = response) => {
  const {
    correo,
    cuentasBancarias,
    cuentasPorCobrar,
    cuentasPorPagar,
    direccion,
    email,
    identificacionFiscal,
    nombre,
    representanteLegal,
    telefono,
    tipo,
    ciudad,
    idRefineria,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevaContacto = new Contacto({
      correo,
      cuentasBancarias,
      cuentasPorCobrar,
      cuentasPorPagar,
      direccion,
      email,
      identificacionFiscal,
      nombre,
      representanteLegal,
      telefono,
      tipo,
      ciudad,
      idRefineria,
    });

    await nuevaContacto.save(); // Guarda el nuevo contacto en la base de datos

    await nuevaContacto.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaContacto); // Responde con un código 201 (creado) y los datos del contacto
  } catch (err) {
    console.error("Error en contactoPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: `Datos de contacto no válidos.${err.message}`,
      }); // Responde con un error 400 si los datos no son válidos
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el contacto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para actualizar un contacto existente
const contactoPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contacto desde los parámetros de la URL
  const { _id, idChequeoCalidad, idChequeoCantidad, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo ciertos campos

  try {
    const contactoActualizada = await Contacto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el contacto no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!contactoActualizada) {
      return res.status(404).json({ msg: "Contacto no encontrado" }); // Responde con un error 404 si no se encuentra el contacto
    }

    res.json(contactoActualizada); // Responde con los datos del contacto actualizado
  } catch (err) {
    console.error("Error en contactoPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contacto no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el contacto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para eliminar (marcar como eliminado) un contacto
const contactoDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del contacto desde los parámetros de la URL

  try {
    const contacto = await Contacto.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el contacto no eliminado
      { eliminado: true }, // Marca el contacto como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!contacto) {
      return res.status(404).json({ msg: "Contacto no encontrado" }); // Responde con un error 404 si no se encuentra el contacto
    }

    res.json(contacto); // Responde con los datos del contacto eliminado
  } catch (err) {
    console.error("Error en contactoDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de contacto no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el contacto.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const contactoPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - contactoPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  contactoGets, // Obtener todos los contactos
  contactoGet, // Obtener un contacto específico por ID
  contactoPost, // Crear un nuevo contacto
  contactoPut, // Actualizar un contacto existente
  contactoDelete, // Eliminar (marcar como eliminado) un contacto
  contactoPatch, // Manejar solicitudes PATCH
};
