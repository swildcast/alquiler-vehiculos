const bcrypt = require('bcryptjs');
const Cliente = require('../models/Cliente');

const SIN_PASSWORD = { attributes: { exclude: ['password'] } };

// 1. Obtener todos los clientes 📋
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll(SIN_PASSWORD);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
  }
};

// 2. Obtener un cliente por ID 🔍
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id, SIN_PASSWORD);

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar cliente', error: error.message });
  }
};

// 3. Crear un cliente ➕ (uso administrativo; el registro de clientes nuevos
//    debe hacerse normalmente vía POST /api/registro)
const crearCliente = async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoCliente = await Cliente.create({ nombre, email, telefono, password: passwordHash });

    const { password: _omit, ...clienteSinPassword } = nuevoCliente.toJSON();
    res.status(201).json(clienteSinPassword);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear cliente', error: error.message });
  }
};

// 4. Actualizar un cliente ✏️
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, password } = req.body;

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    if (nombre) cliente.nombre = nombre;
    if (email) cliente.email = email;
    if (telefono) cliente.telefono = telefono;
    if (password) cliente.password = await bcrypt.hash(password, 10);

    await cliente.save();

    const { password: _omit, ...clienteSinPassword } = cliente.toJSON();
    res.json({ mensaje: 'Cliente actualizado exitosamente', cliente: clienteSinPassword });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar cliente', error: error.message });
  }
};

// 5. Eliminar un cliente 🗑️
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    await cliente.destroy();
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar cliente', error: error.message });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};