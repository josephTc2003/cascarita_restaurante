const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware moderno para JSON (sin body-parser)
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Crear carpeta "data" si no existe para almacenar DB
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Conectar a la DB dentro de "data/database.db"
const dbPath = path.join(dataDir, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos', err.message);
  } else {
    console.log('Conectado a SQLite en:', dbPath);
  }
});

// Crear tablas si no existen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    marca TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    vencimiento TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proveedor TEXT NOT NULL,
    producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL
  )`);
});

// Middleware para log simple de peticiones (opcional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- PEDIDOS ---

app.get('/api/pedidos', (req, res) => {
  db.all("SELECT * FROM pedidos", [], (err, rows) => {
    if (err) {
      console.error('Error get pedidos:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/pedidos', (req, res) => {
  const { nombre, cantidad, marca } = req.body;
  if (!nombre || !cantidad) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  db.run(
    "INSERT INTO pedidos (nombre, cantidad, marca) VALUES (?, ?, ?)",
    [nombre, cantidad, marca || null],
    function (err) {
      if (err) {
        console.error('Error insert pedidos:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/pedidos/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM pedidos WHERE id = ?", [id], function (err) {
    if (err) {
      console.error('Error delete pedido:', err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ success: true });
  });
});

// --- INVENTARIO ---

app.get('/api/inventario', (req, res) => {
  db.all("SELECT * FROM inventario", [], (err, rows) => {
    if (err) {
      console.error('Error get inventario:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/inventario', (req, res) => {
  const { producto, cantidad, vencimiento } = req.body;
  if (!producto || !cantidad || !vencimiento) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  db.run(
    "INSERT INTO inventario (producto, cantidad, vencimiento) VALUES (?, ?, ?)",
    [producto, cantidad, vencimiento],
    function (err) {
      if (err) {
        console.error('Error insert inventario:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// --- COMPRAS ---

app.get('/api/compras', (req, res) => {
  db.all("SELECT * FROM compras", [], (err, rows) => {
    if (err) {
      console.error('Error get compras:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/compras', (req, res) => {
  const { proveedor, producto, cantidad, fecha } = req.body;
  if (!proveedor || !producto || !cantidad || !fecha) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  db.run(
    "INSERT INTO compras (proveedor, producto, cantidad, fecha) VALUES (?, ?, ?, ?)",
    [proveedor, producto, cantidad, fecha],
    function (err) {
      if (err) {
        console.error('Error insert compras:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Middleware para manejar errores no atrapados (por si acaso)
app.use((err, req, res, next) => {
  console.error('Error inesperado:', err);
  res.status(500).json({ error: 'Error inesperado en el servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
