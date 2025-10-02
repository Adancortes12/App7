import express from "express";
import cors from "cors";
import { db } from "./database.js";

const app = express();

app.use(express.json());


app.use(cors({
  origin: "http://localhost:8081", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.get("/ping", (req, res) => {
  db.query("SELECT 1 AS ok", (err) => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true });
  });
});

// Login en texto plano
app.post("/login", (req, res) => {
  const loginRaw = (req.body.usuario || "").trim();
  const password = req.body.password || "";

  if (!loginRaw || !password) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  const login = loginRaw.includes("@") ? loginRaw.toLowerCase() : loginRaw;

  const sql = `
    SELECT id_usuario, nombre, correo, password
    FROM usuarios
    WHERE (correo = ? OR nombre = ?)
    LIMIT 1
  `;

  db.query(sql, [login, login], (err, rows) => {
    if (err) return res.status(500).send("Error en el servidor");
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const user = rows[0];

    // Comparación 
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    return res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
      },
    });
  });
});

 // Escuchar servidor en puerto 3001
const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
