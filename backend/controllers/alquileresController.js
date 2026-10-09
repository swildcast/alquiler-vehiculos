const Alquiler = require('../models/Alquiler');
const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');

// 1. Obtener todos los alquileres (con relaciones) 📋
const obtenerAlquileres = async (req, res) => {
  try {
    const alquileres = await Alquiler.findAll({
      include: [Vehiculo, Cliente] // Trae datos anidados del vehículo y cliente
    });
    res.json(alquileres);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alquileres', error: error.message });
  }
};

// 2. Obtener un alquiler por ID 🔍
const obtenerAlquilerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const alquiler = await Alquiler.findByPk(id, {
      include: [Vehiculo, Cliente]
    });

    if (!alquiler) {
      return res.status(404).json({ mensaje: 'Alquiler no encontrado' });
    }

    res.json(alquiler);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar el alquiler', error: error.message });
  }
};

// 3. Crear un alquiler ➕
const crearAlquiler = async (req, res) => {
  try {
    const { idVehiculo, idCliente, fechaInicio, dias } = req.body;

    if (!idVehiculo || !idCliente || !fechaInicio || !dias) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si existen el vehículo y el cliente antes de registrar el alquiler
    const vehiculo = await Vehiculo.findByPk(idVehiculo);
    const cliente = await Cliente.findByPk(idCliente);

    if (!vehiculo || !cliente) {
      return res.status(400).json({ mensaje: 'El vehículo o cliente especificado no existe' });
    }

    const nuevoAlquiler = await Alquiler.create({
      idVehiculo,
      idCliente,
      fechaInicio,
      dias
    });

    res.status(201).json(nuevoAlquiler);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el alquiler', error: error.message });
  }
};

// 4. Actualizar un alquiler ✏️
const actualizarAlquiler = async (req, res) => {
  try {
    const { id } = req.params;
    const { idVehiculo, idCliente, fechaInicio, dias } = req.body;

    const alquiler = await Alquiler.findByPk(id);

    if (!alquiler) {
      return res.status(404).json({ mensaje: 'Alquiler no encontrado' });
    }

    if (idVehiculo) alquiler.idVehiculo = idVehiculo;
    if (idCliente) alquiler.idCliente = idCliente;
    if (fechaInicio) alquiler.fechaInicio = fechaInicio;
    if (dias) alquiler.dias = dias;

    await alquiler.save();

    res.json({ mensaje: 'Alquiler actualizado exitosamente', alquiler });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el alquiler', error: error.message });
  }
};

// 5. Eliminar un alquiler 🗑️
const eliminarAlquiler = async (req, res) => {
  try {
    const { id } = req.params;
    const alquiler = await Alquiler.findByPk(id);

    if (!alquiler) {
      return res.status(404).json({ mensaje: 'Alquiler no encontrado' });
    }

    await alquiler.destroy();
    res.json({ mensaje: 'Alquiler eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el alquiler', error: error.message });
  }
};

module.exports = {
  obtenerAlquileres,
  obtenerAlquilerPorId,
  crearAlquiler,
  actualizarAlquiler,
  eliminarAlquiler
};