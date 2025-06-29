import express from 'express';
import cors from 'cors';
import db, { initDB } from './database.js';

const app = express();
// Listen on all network interfaces by default so the API can be reached
// from the local machine or a remote host.
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

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
const getActive = (table) => db.prepare(`SELECT * FROM ${table} WHERE isArchived IS NULL OR isArchived=0`).all();
const archiveRecord = (table, id) => {
  db.prepare(`UPDATE ${table} SET isArchived=1 WHERE id=?`).run(id);
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

// Office cost configs endpoints
app.get('/api/office_cost_configs', (req, res) => {
  res.json(getActive('office_cost_configs'));
});
app.post('/api/office_cost_configs', (req, res) => {
  insertRecord('office_cost_configs', req.body);
  res.json({ status: 'ok' });
});
app.put('/api/office_cost_configs/:id', (req, res) => {
  updateRecord('office_cost_configs', req.params.id, req.body);
  res.json({ status: 'ok' });
});
app.delete('/api/office_cost_configs/:id', (req, res) => {
  archiveRecord('office_cost_configs', req.params.id);
  res.json({ status: 'ok' });
});

// Team member configs endpoints
app.get('/api/team_member_configs', (req, res) => {
  res.json(getActive('team_member_configs'));
});
app.post('/api/team_member_configs', (req, res) => {
  insertRecord('team_member_configs', req.body);
  res.json({ status: 'ok' });
});
app.put('/api/team_member_configs/:id', (req, res) => {
  updateRecord('team_member_configs', req.params.id, req.body);
  res.json({ status: 'ok' });
});
app.delete('/api/team_member_configs/:id', (req, res) => {
  archiveRecord('team_member_configs', req.params.id);
  res.json({ status: 'ok' });
});

// Cost simulations endpoints
app.get('/api/cost_simulations', (req, res) => {
  const rows = db.prepare('SELECT * FROM cost_simulations').all();
  const sims = rows.map(r => ({ id: r.id, leadId: r.leadId, ...JSON.parse(r.data) }));
  res.json(sims);
});
app.post('/api/cost_simulations', (req, res) => {
  insertRecord('cost_simulations', { id: req.body.id, leadId: req.body.leadId, data: JSON.stringify(req.body) });
  res.json({ status: 'ok' });
});
app.put('/api/cost_simulations/:id', (req, res) => {
  updateRecord('cost_simulations', req.params.id, { leadId: req.body.leadId, data: JSON.stringify(req.body) });
  res.json({ status: 'ok' });
});

app.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`API server running on http://${displayHost}:${PORT}`);
});
