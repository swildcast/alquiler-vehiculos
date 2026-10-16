const { Op } = require('sequelize');
const Alquiler = require('../models/Alquiler');
const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');

// Función auxiliar para calcular la fecha final de un alquiler
const calcularFechaFin = (fechaInicio, dias) => {
  const fecha = new Date(fechaInicio);
  fecha.setDate(fecha.getDate() + Number(dias));
  return fecha;
};

// 1. Obtener todos los alquileres (con datos de Vehículo y Cliente)
const obtenerAlquileres = async (req, res) => {
  try {
    const alquileres = await Alquiler.findAll({
      include: [Vehiculo, Cliente]
    });
    res.json(alquileres);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alquileres', error: error.message });
  }
};

// 2. Obtener alquiler por ID
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

// 3. Crear un alquiler con validación de disponibilidad
const crearAlquiler = async (req, res) => {
  try {
    const { idVehiculo, idCliente, fechaInicio, dias } = req.body;

    // Validación A: Campos requeridos
    if (!idVehiculo || !idCliente || !fechaInicio || !dias) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    if (Number(dias) <= 0) {
      return res.status(400).json({ mensaje: 'El número de días debe ser mayor a 0' });
    }

    // Validación B: Verificar existencia de Vehículo y Cliente
    const vehiculo = await Vehiculo.findByPk(idVehiculo);
    const cliente = await Cliente.findByPk(idCliente);

    if (!vehiculo) {
      return res.status(404).json({ mensaje: 'El vehículo especificado no existe' });
    }

    if (!cliente) {
      return res.status(404).json({ mensaje: 'El cliente especificado no existe' });
    }

    // Validación C: Verificar disponibilidad (cruce de fechas)
    const nuevoInicio = new Date(fechaInicio);
    const nuevoFin = calcularFechaFin(fechaInicio, dias);

    const alquileresExistentes = await Alquiler.findAll({
      where: { idVehiculo }
    });

    const hayCruce = alquileresExistentes.some((alquiler) => {
      const inicioExistente = new Date(alquiler.fechaInicio);
      const finExistente = calcularFechaFin(alquiler.fechaInicio, alquiler.dias);

      return nuevoInicio < finExistente && nuevoFin > inicioExistente;
    });

    if (hayCruce) {
      return res.status(400).json({
        mensaje: 'El vehículo no está disponible en el rango de fechas seleccionado'
      });
    }

    // Crear el registro en PostgreSQL
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

// 4. Actualizar alquiler
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

// 5. Eliminar alquiler
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