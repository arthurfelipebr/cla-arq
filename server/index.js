import express from 'express';
import cors from 'cors';
import db, { initDB } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

initDB();
app.use(cors());
app.use(express.json());

// Helper functions
const getAll = (table) => db.prepare(`SELECT * FROM ${table}`).all();
const insertRecord = (table, record) => {
  const keys = Object.keys(record);
  const placeholders = keys.map(() => '?').join(',');
  const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`);
  stmt.run(...keys.map(k => record[k]));
};
const updateRecord = (table, id, record) => {
  const keys = Object.keys(record).filter(k => k !== 'id');
  const assignments = keys.map(k => `${k}=?`).join(',');
  const stmt = db.prepare(`UPDATE ${table} SET ${assignments} WHERE id=?`);
  stmt.run(...keys.map(k => record[k]), id);
};
const deleteRecord = (table, id) => {
  db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id);
};

// Clients endpoints
app.get('/api/clients', (req, res) => {
  res.json(getAll('clients'));
});
app.post('/api/clients', (req, res) => {
  insertRecord('clients', req.body);
  res.json({ status: 'ok' });
});
app.put('/api/clients/:id', (req, res) => {
  updateRecord('clients', req.params.id, req.body);
  res.json({ status: 'ok' });
});
app.delete('/api/clients/:id', (req, res) => {
  deleteRecord('clients', req.params.id);
  res.json({ status: 'ok' });
});

// Projects endpoints
app.get('/api/projects', (req, res) => {
  res.json(getAll('projects'));
});
app.post('/api/projects', (req, res) => {
  insertRecord('projects', req.body);
  res.json({ status: 'ok' });
});
app.put('/api/projects/:id', (req, res) => {
  updateRecord('projects', req.params.id, req.body);
  res.json({ status: 'ok' });
});
app.delete('/api/projects/:id', (req, res) => {
  deleteRecord('projects', req.params.id);
  res.json({ status: 'ok' });
});

// Leads endpoints
app.get('/api/leads', (req, res) => {
  res.json(getAll('leads'));
});
app.post('/api/leads', (req, res) => {
  insertRecord('leads', req.body);
  res.json({ status: 'ok' });
});
app.put('/api/leads/:id', (req, res) => {
  updateRecord('leads', req.params.id, req.body);
  res.json({ status: 'ok' });
});
app.delete('/api/leads/:id', (req, res) => {
  deleteRecord('leads', req.params.id);
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
