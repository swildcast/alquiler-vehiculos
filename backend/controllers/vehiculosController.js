const Vehiculo = require('../models/Vehiculo');

// 1. Obtener todos los vehículos 📋
const obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll();
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener vehículos', error: error.message });
  }
};

// 2. Obtener un vehículo por ID 🔍
const obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar el vehículo', error: error.message });
  }
};

// 3. Crear un vehículo ➕
const crearVehiculo = async (req, res) => {
  try {
    const { marca, modelo } = req.body;

    if (!marca || !modelo) {
      return res.status(400).json({ mensaje: 'Marca y modelo son obligatorios' });
    }

    const nuevoVehiculo = await Vehiculo.create({ marca, modelo });
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el vehículo', error: error.message });
  }
};

// 4. Actualizar un vehículo ✏️
const actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
    }

    if (marca) vehiculo.marca = marca;
    if (modelo) vehiculo.modelo = modelo;

    await vehiculo.save();

    res.json({ mensaje: 'Vehículo actualizado exitosamente', vehiculo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el vehículo', error: error.message });
  }
};

// 5. Eliminar un vehículo 🗑️
const eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
    }

    await vehiculo.destroy();
    res.json({ mensaje: 'Vehículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el vehículo', error: error.message });
  }
};

module.exports = {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
};