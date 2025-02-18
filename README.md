# Sistema-de-Login-Seguro
Ejemplo de Sistema de Login Seguro utilizando Hashing y Salteo.

npm install para descargar e instalar todas las dependencias.

Se utilzó bcrypt para encriptar las contraseñas
Express y CORS como middleware a la base de datos
MySQL para manipular la base de datos.

Estructura de la tabla de SQL para el sistema:


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

