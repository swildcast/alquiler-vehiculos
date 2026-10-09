const express = require('express');
const router = express.Router();
const alquileresController = require('../controllers/alquileresController');

router.get('/', alquileresController.obtenerAlquileres);
router.get('/:id', alquileresController.obtenerAlquilerPorId);
router.post('/', alquileresController.crearAlquiler);
router.put('/:id', alquileresController.actualizarAlquiler);
router.delete('/:id', alquileresController.eliminarAlquiler);

module.exports = router;