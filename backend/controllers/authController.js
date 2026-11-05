const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cliente = require('../models/Cliente');

// En un entorno real esto debe venir de una variable de entorno (JWT_SECRET).
const JWT_SECRET = process.env.JWT_SECRET || 'drivenow_dev_secret_cambia_esto_en_produccion';

const generarToken = (cliente) =>
  jwt.sign({ id: cliente.id, email: cliente.email, rol: cliente.rol }, JWT_SECRET, { expiresIn: '8h' });

const sanitizar = (cliente) => ({
  id: cliente.id,
  nombre: cliente.nombre,
  email: cliente.email,
  rol: cliente.rol
});

// 1. Registro de un nuevo cliente
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existente = await Cliente.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cliente = await Cliente.create({
      nombre,
      email,
      telefono,
      password: passwordHash,
      rol: 'cliente'
    });

    const token = generarToken(cliente);
    res.status(201).json({ token, usuario: sanitizar(cliente) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

// 2. Login contra PostgreSQL con verificación de hash
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const cliente = await Cliente.findOne({ where: { email } });
    if (!cliente) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const passwordValida = await bcrypt.compare(password, cliente.password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const token = generarToken(cliente);
    res.json({ token, usuario: sanitizar(cliente) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = { registrar, login };
