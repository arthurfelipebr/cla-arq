import db from './database.js';
import { DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE, DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE } from './defaults.js';

const ACTIVE_CLAUSE = 'isArchived IS NULL OR isArchived = 0';

// --- Helper to insert multiple rows in a transaction ---
function insertMany(table, items, columns) {
  const cols = columns || Object.keys(items[0]);
  const placeholders = cols.map(() => '?').join(',');
  const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`);
  const run = db.transaction((records) => {
    for (const r of records) {
      stmt.run(...cols.map(c => r[c]));
    }
  });
  run(items);
}

// --- Office Cost Configs ---
export function getAllOfficeCostConfigs() {
  let rows = db.prepare(`SELECT * FROM office_cost_configs WHERE ${ACTIVE_CLAUSE}`).all();
  if (rows.length === 0) {
    insertMany('office_cost_configs', DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE, ['id','name','monthlyBaseValue','isArchived']);
    rows = db.prepare(`SELECT * FROM office_cost_configs WHERE ${ACTIVE_CLAUSE}`).all();
  }
  return rows;
}

export function addOrUpdateOfficeCostConfig(item) {
  const exists = db.prepare('SELECT COUNT(*) as count FROM office_cost_configs WHERE id=?').get(item.id).count > 0;
  if (exists) {
    db.prepare('UPDATE office_cost_configs SET name=@name, monthlyBaseValue=@monthlyBaseValue WHERE id=@id').run(item);
  } else {
    insertMany('office_cost_configs', [{...item, isArchived:0}], ['id','name','monthlyBaseValue','isArchived']);
  }
}

export function deleteOfficeCostConfig(id) {
  db.prepare('UPDATE office_cost_configs SET isArchived=1 WHERE id=?').run(id);
}

// --- Team Member Configs ---
export function getAllTeamMemberConfigs() {
  let rows = db.prepare(`SELECT * FROM team_member_configs WHERE ${ACTIVE_CLAUSE}`).all();
  if (rows.length === 0) {
    insertMany('team_member_configs', DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE.map(i => ({...i,isArchived:0})), ['id','name','role','hourlyRate','isArchived']);
    rows = db.prepare(`SELECT * FROM team_member_configs WHERE ${ACTIVE_CLAUSE}`).all();
  }
  return rows;
}

export function addOrUpdateTeamMemberConfig(item) {
  const exists = db.prepare('SELECT COUNT(*) as count FROM team_member_configs WHERE id=?').get(item.id).count > 0;
  if (exists) {
    db.prepare('UPDATE team_member_configs SET name=@name, role=@role, hourlyRate=@hourlyRate WHERE id=@id').run(item);
  } else {
    insertMany('team_member_configs', [{...item,isArchived:0}], ['id','name','role','hourlyRate','isArchived']);
  }
}

export function deleteTeamMemberConfig(id) {
  db.prepare('UPDATE team_member_configs SET isArchived=1 WHERE id=?').run(id);
}

// --- Users (Team Members) ---
export function getAllUsers() {
  return db.prepare(`SELECT id, name, email, role, hourlyRate FROM users WHERE ${ACTIVE_CLAUSE}`).all();
}

export function addOrUpdateUser(user) {
  const exists = db.prepare('SELECT COUNT(*) as count FROM users WHERE id=?').get(user.id).count > 0;
  const data = { id:user.id, name:user.name, email:user.email, role:user.role, hourlyRate:user.hourlyRate };
  if (exists) {
    db.prepare('UPDATE users SET name=@name, email=@email, role=@role, hourlyRate=@hourlyRate WHERE id=@id').run(data);
  } else {
    insertMany('users', [{...data,isArchived:0}], ['id','name','email','role','hourlyRate','isArchived']);
  }
}

export function deleteUser(id) {
  db.prepare('UPDATE users SET isArchived=1 WHERE id=?').run(id);
}

// --- Cost Simulations ---
export function getAllCostSimulations() {
  const rows = db.prepare(`SELECT id, leadId, data FROM cost_simulations WHERE ${ACTIVE_CLAUSE}`).all();
  return rows.map(r => ({ id: r.id, leadId: r.leadId, ...JSON.parse(r.data) }));
}

export function addOrUpdateCostSimulation(sim) {
  const exists = db.prepare('SELECT COUNT(*) as count FROM cost_simulations WHERE id=?').get(sim.id).count > 0;
  const record = { id: sim.id, leadId: sim.leadId, data: JSON.stringify(sim) };
  if (exists) {
    db.prepare('UPDATE cost_simulations SET leadId=@leadId, data=@data WHERE id=@id').run(record);
  } else {
    insertMany('cost_simulations', [{...record, isArchived:0}], ['id','leadId','data','isArchived']);
  }
}

export function deleteCostSimulation(id) {
  db.prepare('UPDATE cost_simulations SET isArchived=1 WHERE id=?').run(id);
}
