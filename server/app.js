// app.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { db } from './database.js';   

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// 🔌 Rutas de prueba
app.get('/ping', (req, res) => {
  db.query('SELECT 1 AS ok', (err) => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true });
  });
});

//verificar disponibilidad de correo y nombre
app.post('/check-availability', (req, res) => {
  const { correo, nombre } = req.body || {};
  if (!correo || !nombre) {
    return res
      .status(400)
      .json({ ok: false, error: 'faltan_campos', camposRequeridos: ['correo', 'nombre'] });
  }
  const correoNorm = String(correo).toLowerCase().trim();
  const nombreNorm = String(nombre).trim();

  db.query(
    `SELECT
       EXISTS(SELECT 1 FROM usuarios WHERE correo = ? LIMIT 1) AS correo_ocupado,
       EXISTS(SELECT 1 FROM usuarios WHERE nombre = ? LIMIT 1) AS nombre_ocupado`,
    [correoNorm, nombreNorm],
    (err, rows) => {
      if (err) return res.status(500).send('Error en la base de datos');

      const { correo_ocupado, nombre_ocupado } = rows[0] || {};
      if (correo_ocupado && nombre_ocupado) {
        return res.status(409).json({ ok: false, reason: ['correo_ocupado', 'nombre_ocupado'] });
      }
      if (correo_ocupado) return res.status(409).json({ ok: false, reason: 'correo_ocupado' });
      if (nombre_ocupado) return res.status(409).json({ ok: false, reason: 'nombre_ocupado' });

      return res.status(200).json({ ok: true, available: true });
    }
  );
});

//login
app.post('/login', (req, res) => {
  const loginRaw = (req.body.usuario || '').trim(); // correo o nombre
  const password = req.body.password || '';
  if (!loginRaw || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  const login = loginRaw.includes('@') ? loginRaw.toLowerCase() : loginRaw;

  const sql = `
    SELECT id_usuario, nombre, correo, password
    FROM usuarios
    WHERE (correo = ? OR nombre = ?)
    LIMIT 1
  `;

  db.query(sql, [login, login], async (err, rows) => {
    if (err) return res.status(500).send('Error en el servidor');
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    try {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
      return res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: { id: user.id_usuario, nombre: user.nombre, correo: user.correo },
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Error al validar contraseña' });
    }
  });
});

