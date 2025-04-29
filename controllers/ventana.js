// Importaciones necesarias
const { response, request } = require("express"); // Objetos de Express para manejar solicitudes y respuestas
const Ventana = require("../models/ventana"); // Modelo Ventana para interactuar con la base de datos
const { selectFields } = require("express-validator/src/select-fields"); // Utilidad para validaciones (no utilizada en este código)

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "idRefineria", select: "nombre" }, // Relación con el modelo Refineria, seleccionando solo el campo "nombre"
  {
    path: "compra",
    populate: {
      path: "idItems",
      populate: {
        path: "producto", // Poblar la información asociada a producto dentro de idItems
      }, // Poblar toda la información de idItems
    },
  },
  {
    path: "venta",
    populate: {
      path: "idItems",
      populate: {
        path: "producto", // Poblar la información asociada a producto dentro de idItems
      }, // Poblar toda la información de idItems
    },
  },
  { path: "gasto" }, // Relación con el modelo Gasto
];

// Controlador para obtener todas las ventanas con población de referencias
const ventanaGets = async (req = request, res = response) => {
  const query = { eliminado: false }; // Filtro para obtener solo ventanas activos y no eliminados

  try {
    const [total, ventanas] = await Promise.all([
      Ventana.countDocuments(query), // Cuenta el total de ventanas
      Ventana.find(query).populate(populateOptions), // Obtiene los ventanas con referencias pobladas
    ]);

    if (ventanas.length === 0) {
      return res.status(404).json({
        message: "No se encontraron ventanas con los criterios proporcionados.",
      }); // Responde con un error 404 si no se encuentran ventanas
    }

    res.json({ total, ventanas }); // Responde con el total y la lista de ventanas
  } catch (err) {
    console.error("Error en ventanaGets:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Error en las referencias. Verifica que los IDs sean válidos.",
      }); // Responde con un error 400 si hay un problema con las referencias
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener las ventanas.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para obtener un ventana específico por ID
const ventanaGet = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del ventana desde los parámetros de la URL

  try {
    const ventana = await Ventana.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions); // Busca el ventana por ID y popula las referencias

    if (!ventana) {
      return res.status(404).json({ msg: "Ventana no encontrado" }); // Responde con un error 404 si no se encuentra el ventana
    }

    res.json(ventana); // Responde con los datos del ventana
  } catch (err) {
    console.error("Error en ventanaGet:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de ventana no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al obtener el ventana.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para crear un nuevo ventana
const ventanaPost = async (req = request, res = response) => {
  const {
    idRefineria,
    compra,
    venta,
    gasto,
    maquila,
    monto,
    fechaInicio,
    fechaFin,
    estadoVentana,
  } = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    const nuevaVentana = new Ventana({
      idRefineria,
      compra,
      venta,
      gasto,
      maquila,
      monto,
      fechaInicio,
      fechaFin,
      estadoVentana,
    });

    await nuevaVentana.save(); // Guarda el nuevo ventana en la base de datos

    await nuevaVentana.populate(populateOptions); // Poblar referencias después de guardar

    res.status(201).json(nuevaVentana); // Responde con un código 201 (creado) y los datos del ventana
  } catch (err) {
    console.error("Error en ventanaPost:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos de ventana no válidos.",
      }); // Responde con un error 400 si los datos no son válidos
    }

    res.status(500).json({
      error: "Error interno del servidor al crear el ventana.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para actualizar un ventana existente
const ventanaPut = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del ventana desde los parámetros de la URL
  const { _id, ...resto } = req.body; // Extrae los datos del cuerpo de la solicitud, excluyendo el campo "_id"

  try {
    const ventanaActualizada = await Ventana.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el ventana no eliminado
      resto, // Datos a actualizar
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!ventanaActualizada) {
      return res.status(404).json({ msg: "Ventana no encontrado" }); // Responde con un error 404 si no se encuentra el ventana
    }

    res.json(ventanaActualizada); // Responde con los datos del ventana actualizado
  } catch (err) {
    console.error("Error en ventanaPut:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de ventana no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar el ventana.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para eliminar (marcar como eliminado) un ventana
const ventanaDelete = async (req = request, res = response) => {
  const { id } = req.params; // Obtiene el ID del ventana desde los parámetros de la URL

  try {
    const ventana = await Ventana.findOneAndUpdate(
      { _id: id, eliminado: false }, // Filtro para encontrar el ventana no eliminado
      { eliminado: true }, // Marca el ventana como eliminado
      { new: true } // Devuelve el documento actualizado
    ).populate(populateOptions); // Poblar referencias después de actualizar

    if (!ventana) {
      return res.status(404).json({ msg: "Ventana no encontrado" }); // Responde con un error 404 si no se encuentra el ventana
    }

    res.json(ventana); // Responde con los datos del ventana eliminado
  } catch (err) {
    console.error("Error en ventanaDelete:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        error: "ID de ventana no válido.",
      }); // Responde con un error 400 si el ID no es válido
    }

    res.status(500).json({
      error: "Error interno del servidor al eliminar el ventana.",
    }); // Responde con un error 500 en caso de un problema interno
  }
};

// Controlador para manejar solicitudes PATCH (ejemplo básico)
const ventanaPatch = (req = request, res = response) => {
  res.json({
    msg: "patch API - ventanaPatch", // Mensaje de prueba
  });
};

// Exporta los controladores para que puedan ser utilizados en las rutas
module.exports = {
  ventanaGets, // Obtener todas las ventanas
  ventanaGet, // Obtener un ventana específico por ID
  ventanaPost, // Crear un nuevo ventana
  ventanaPut, // Actualizar un ventana existente
  ventanaDelete, // Eliminar (marcar como eliminado) un ventana
  ventanaPatch, // Manejar solicitudes PATCH
};
