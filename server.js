import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PORT = process.env.PORT || 3000;

function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {}
  return null;
}

function writeDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/api/nodes', (req, res) => {
  const db = readDb();
  if (db && Array.isArray(db.nodes)) {
    res.json({ nodes: db.nodes, generations: db.generations || [] });
  } else {
    res.status(404).json({ nodes: [], generations: [] });
  }
});

app.post('/api/nodes', (req, res) => {
  try {
    const payload = req.body;
    const nodes = payload.nodes || (Array.isArray(payload) ? payload : []);
    const generations = payload.generations || [];
    const sorted = [...nodes].sort((a, b) => {
      if (a.isRoot && !b.isRoot) return -1;
      if (!a.isRoot && b.isRoot) return 1;
      if (a.parentId !== b.parentId) return (a.parentId || 0) - (b.parentId || 0);
      return a.id - b.id;
    });
    const db = readDb() || { tree: { name: 'Family Tree', createdAt: new Date().toISOString().slice(0, 10) } };
    db.nodes = sorted;
    db.generations = generations;
    db.tree.updatedAt = new Date().toISOString().slice(0, 10);
    writeDb(db);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: 'invalid data' });
  }
});

app.get('/api/tree', (req, res) => {
  const db = readDb();
  res.json(db?.tree || {});
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Family Tree app running at http://localhost:${PORT}`);
});
