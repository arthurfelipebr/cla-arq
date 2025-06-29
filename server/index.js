import express from 'express';
import cors from 'cors';
import db, { initDB } from './database.js';
import {
  getAllOfficeCostConfigs,
  addOrUpdateOfficeCostConfig,
  deleteOfficeCostConfig,
  getAllTeamMemberConfigs,
  addOrUpdateTeamMemberConfig,
  deleteTeamMemberConfig,
  getAllUsers,
  addOrUpdateUser,
  deleteUser,
  getAllCostSimulations,
  addOrUpdateCostSimulation,
  deleteCostSimulation
} from './dataAccess.js';

const app = express();
// Listen on all network interfaces by default so the API can be reached
// from the local machine or a remote host.
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

initDB();
const initialOffice = getAllOfficeCostConfigs().length;
const initialTeamCfg = getAllTeamMemberConfigs().length;
const initialUsers = getAllUsers().length;
const initialSims = getAllCostSimulations().length;
console.log(`Loaded ${initialOffice} office configs, ${initialTeamCfg} team member configs, ${initialUsers} users, ${initialSims} cost simulations`);
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
  try {
    res.json(getAllOfficeCostConfigs());
  } catch (err) {
    console.error('Failed to load office cost configs', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/office_cost_configs', (req, res) => {
  try {
    addOrUpdateOfficeCostConfig(req.body);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to save office cost config', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/api/office_cost_configs/:id', (req, res) => {
  try {
    addOrUpdateOfficeCostConfig({ ...req.body, id: req.params.id });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to update office cost config', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/office_cost_configs/:id', (req, res) => {
  try {
    deleteOfficeCostConfig(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to delete office cost config', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team member configs endpoints
app.get('/api/team_member_configs', (req, res) => {
  try {
    res.json(getAllTeamMemberConfigs());
  } catch (err) {
    console.error('Failed to load team member configs', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/team_member_configs', (req, res) => {
  try {
    addOrUpdateTeamMemberConfig(req.body);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to save team member config', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/api/team_member_configs/:id', (req, res) => {
  try {
    addOrUpdateTeamMemberConfig({ ...req.body, id: req.params.id });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to update team member config', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/team_member_configs/:id', (req, res) => {
  try {
    deleteTeamMemberConfig(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to delete team member config', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users (team members) endpoints
app.get('/api/team-members', (req, res) => {
  try {
    res.json(getAllUsers());
  } catch (err) {
    console.error('Failed to load users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/team-members', (req, res) => {
  try {
    addOrUpdateUser(req.body);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to save user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/api/team-members/:id', (req, res) => {
  try {
    addOrUpdateUser({ ...req.body, id: req.params.id });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to update user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/team-members/:id', (req, res) => {
  try {
    deleteUser(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to delete user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cost simulations endpoints
app.get('/api/cost_simulations', (req, res) => {
  try {
    res.json(getAllCostSimulations());
  } catch (err) {
    console.error('Failed to load cost simulations', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/cost_simulations', (req, res) => {
  try {
    addOrUpdateCostSimulation(req.body);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to save cost simulation', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/api/cost_simulations/:id', (req, res) => {
  try {
    addOrUpdateCostSimulation({ ...req.body, id: req.params.id });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to update cost simulation', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/cost_simulations/:id', (req, res) => {
  try {
    deleteCostSimulation(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to delete cost simulation', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`API server running on http://${displayHost}:${PORT}`);
});
