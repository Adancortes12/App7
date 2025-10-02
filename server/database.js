// database.js
import mysql from 'mysql2';

// Exportamos la conexión como "db"
export const db = mysql.createPool({
  host: 'localhost',     // 👈 tu servidor MySQL
  user: 'root',          // 👈 tu usuario MySQL
  password: '',          // 👈 pon tu contraseña si tienes
  database: 'App',       // 👈 debe coincidir con la BD que creaste
  connectionLimit: 10,   // conexiones máximas en el pool
});
