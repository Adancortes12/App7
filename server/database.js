// database.js
import mysql from "mysql2";

//Configuración de conexión
export const db = mysql.createPool({
  host: "localhost",      
  user: "root",           
  password: "",           
  database: "App",        
  waitForConnections: true,
  connectionLimit: 10,    
  queueLimit: 0
});

// Probar conexión al iniciar
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
    process.exit(1); 
  } else {
    console.log("Conectado a MySQL correctamente");
    connection.release();
  }
});
