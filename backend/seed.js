/*
 * Script de seed: puebla PostgreSQL (alquileres_db) con 10 usuarios/clientes
 * de prueba y 12 vehículos completos (specs + foto de Unsplash).
 *
 * Uso:  npm run seed
 */
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const Cliente = require('./models/Cliente');
const Vehiculo = require('./models/Vehiculo');
require('./models/Alquiler'); // registra la relación Alquiler -> Vehiculo/Cliente

const USUARIOS_DEMO = [
  { nombre: 'Ana Torres',      email: 'ana.torres@drivenow.com',      password: 'cliente123', rol: 'cliente' },
  { nombre: 'Luis Ramírez',    email: 'luis.ramirez@drivenow.com',    password: 'cliente123', rol: 'cliente' },
  { nombre: 'María Gómez',     email: 'maria.gomez@drivenow.com',     password: 'cliente123', rol: 'cliente' },
  { nombre: 'Carlos Pérez',    email: 'carlos.perez@drivenow.com',    password: 'cliente123', rol: 'cliente' },
  { nombre: 'Sofía Mendoza',   email: 'sofia.mendoza@drivenow.com',   password: 'cliente123', rol: 'cliente' },
  { nombre: 'Jorge Castillo',  email: 'jorge.castillo@drivenow.com',  password: 'cliente123', rol: 'cliente' },
  { nombre: 'Valentina Rojas', email: 'valentina.rojas@drivenow.com', password: 'cliente123', rol: 'cliente' },
  { nombre: 'Diego Fernández', email: 'diego.fernandez@drivenow.com', password: 'cliente123', rol: 'cliente' },
  { nombre: 'Camila Vargas',   email: 'camila.vargas@drivenow.com',   password: 'cliente123', rol: 'cliente' },
  { nombre: 'Admin DriveNow',  email: 'admin@drivenow.com',           password: 'admin123',   rol: 'admin' }
];

const VEHICULOS_DEMO = [
  { marca: 'Toyota',        modelo: 'Corolla',  tipo: 'Sedán',     transmision: 'Automática', pasajeros: 5, combustible: 'Gasolina',  maletas: 3, precioPorDia: 45,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1623869675184-67e596fb66bd?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Honda',         modelo: 'Civic',    tipo: 'Sedán',     transmision: 'Automática', pasajeros: 5, combustible: 'Gasolina',  maletas: 3, precioPorDia: 48,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Ford',          modelo: 'Explorer', tipo: 'SUV',       transmision: 'Automática', pasajeros: 7, combustible: 'Gasolina',  maletas: 5, precioPorDia: 70,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Chevrolet',     modelo: 'Camaro',   tipo: 'Deportivo', transmision: 'Manual',     pasajeros: 2, combustible: 'Gasolina',  maletas: 2, precioPorDia: 120, disponible: false, imagenUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=70' },
  { marca: 'BMW',           modelo: 'Serie 3',  tipo: 'Lujo',      transmision: 'Automática', pasajeros: 5, combustible: 'Gasolina',  maletas: 3, precioPorDia: 95,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Mercedes-Benz', modelo: 'Clase C',  tipo: 'Lujo',      transmision: 'Automática', pasajeros: 5, combustible: 'Gasolina',  maletas: 3, precioPorDia: 110, disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Nissan',        modelo: 'Versa',    tipo: 'Sedán',     transmision: 'Manual',     pasajeros: 5, combustible: 'Gasolina',  maletas: 2, precioPorDia: 38,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Hyundai',       modelo: 'Tucson',   tipo: 'SUV',       transmision: 'Automática', pasajeros: 5, combustible: 'Híbrido',   maletas: 4, precioPorDia: 65,  disponible: false, imagenUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Kia',           modelo: 'Sportage', tipo: 'SUV',       transmision: 'Automática', pasajeros: 5, combustible: 'Gasolina',  maletas: 4, precioPorDia: 60,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Jeep',          modelo: 'Wrangler', tipo: 'SUV',       transmision: 'Manual',     pasajeros: 4, combustible: 'Gasolina',  maletas: 3, precioPorDia: 85,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d109?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Volkswagen',    modelo: 'Jetta',    tipo: 'Sedán',     transmision: 'Automática', pasajeros: 5, combustible: 'Gasolina',  maletas: 3, precioPorDia: 42,  disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=70' },
  { marca: 'Tesla',         modelo: 'Model 3',  tipo: 'Eléctrico', transmision: 'Automática', pasajeros: 5, combustible: 'Eléctrico', maletas: 2, precioPorDia: 130, disponible: true,  imagenUrl: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=800&q=70' }
];

async function seedUsuarios() {
  let creados = 0;
  for (const usuario of USUARIOS_DEMO) {
    const [, fueCreado] = await Cliente.findOrCreate({
      where: { email: usuario.email },
      defaults: {
        nombre: usuario.nombre,
        password: await bcrypt.hash(usuario.password, 10),
        rol: usuario.rol
      }
    });
    if (fueCreado) creados++;
  }
  console.log(`Usuarios: ${creados} creados, ${USUARIOS_DEMO.length - creados} ya existían.`);
}

async function seedVehiculos() {
  let creados = 0;
  for (const vehiculo of VEHICULOS_DEMO) {
    const [, fueCreado] = await Vehiculo.findOrCreate({
      where: { marca: vehiculo.marca, modelo: vehiculo.modelo },
      defaults: vehiculo
    });
    if (fueCreado) creados++;
  }
  console.log(`Vehículos: ${creados} creados, ${VEHICULOS_DEMO.length - creados} ya existían.`);
}

(async () => {
  try {
    await sequelize.sync();
    console.log('Tablas sincronizadas. Insertando datos de prueba...');
    await seedUsuarios();
    await seedVehiculos();
    console.log('Seed completado. Credenciales de prueba: ana.torres@drivenow.com / cliente123 (cliente), admin@drivenow.com / admin123 (admin).');
  } catch (error) {
    console.error('Error ejecutando el seed:', error);
  } finally {
    await sequelize.close();
  }
})();
