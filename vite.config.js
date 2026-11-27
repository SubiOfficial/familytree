import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('data/db.json');

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

function nodesApiPlugin() {
  return {
    name: 'nodes-api',
    configureServer(server) {
      server.middlewares.use('/api/nodes', (req, res) => {
        if (req.method === 'GET') {
          const db = readDb();
          if (db && Array.isArray(db.nodes)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(db.nodes));
          } else {
            res.statusCode = 404;
            res.end('[]');
          }
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const nodes = JSON.parse(body);
              if (!Array.isArray(nodes)) throw new Error('not array');
              const sorted = [...nodes].sort((a, b) => {
                if (a.isRoot && !b.isRoot) return -1;
                if (!a.isRoot && b.isRoot) return 1;
                if (a.parentId !== b.parentId) return (a.parentId || 0) - (b.parentId || 0);
                return a.id - b.id;
              });
              const db = readDb() || { tree: { name: 'Family Tree', createdAt: new Date().toISOString().slice(0, 10) } };
              db.nodes = sorted;
              db.tree.updatedAt = new Date().toISOString().slice(0, 10);
              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.end('{"ok":true}');
            } catch {
              res.statusCode = 400;
              res.end('{"error":"invalid data"}');
            }
          });
        } else {
          res.statusCode = 405;
          res.end('');
        }
      });

      server.middlewares.use('/api/tree', (req, res) => {
        if (req.method === 'GET') {
          const db = readDb();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(db?.tree || {}));
        } else {
          res.statusCode = 405;
          res.end('');
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), nodesApiPlugin()],
});
