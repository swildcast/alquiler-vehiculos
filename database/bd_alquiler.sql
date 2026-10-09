CREATE DATABASE IF NOT EXISTS bd_alquiler;
USE bd_alquiler;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'cliente'
);

CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    precio_dia DECIMAL(10, 2) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE
);

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
);


-- 1. Insertar un cliente de prueba
INSERT INTO usuarios (nombre, correo, password, telefono, rol) 
VALUES ('Carlos Gómez', 'carlos@email.com', 'clave123', '3001234567', 'cliente');

-- 2. Insertar un vehículo de prueba
INSERT INTO vehiculos (marca, modelo, precio_dia, disponible) 
VALUES ('Toyota', 'Corolla', 50.00, TRUE);

-- 3. Insertar una reserva relacionando el usuario (id: 1) y el vehículo (id: 1)
INSERT INTO reservas (usuario_id, vehiculo_id, fecha_inicio, fecha_fin, metodo_pago, total) 
VALUES (1, 1, '2026-10-10 08:00:00', '2026-10-12 18:00:00', 'efectivo', 100.00);

DELIMITER //

// trigger para actualizar la disponibilidad del vehículo al realizar una reserva
CREATE TRIGGER actualizar_disponibilidad_vehiculo
AFTER INSERT ON reservas
FOR EACH ROW
BEGIN
    UPDATE vehiculos
    SET disponible = FALSE
    WHERE id = NEW.vehiculo_id;
END;
//

DELIMITER ;


// triger para cancelar la reserva y actualizar la disponibilidad del vehículo

DELIMITER //

CREATE TRIGGER restaurar_disponibilidad_vehiculo
AFTER DELETE ON reservas
FOR EACH ROW
BEGIN
    UPDATE vehiculos
    SET disponible = TRUE
    WHERE id = OLD.vehiculo_id;
END;
//

DELIMITER ;