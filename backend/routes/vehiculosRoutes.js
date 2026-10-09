const express = require('express');
const router = express.Router();
const vehiculosController = require('../controllers/vehiculosController');

// Lectura (GET)
router.get('/', vehiculosController.obtenerVehiculos);
router.get('/:id', vehiculosController.obtenerVehiculoPorId);

// Creación (POST)
router.post('/', vehiculosController.crearVehiculo);

// Actualización (PUT)
router.put('/:id', vehiculosController.actualizarVehiculo);

// Eliminación (DELETE)
router.delete('/:id', vehiculosController.eliminarVehiculo);

module.exports = router;