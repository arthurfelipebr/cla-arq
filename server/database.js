import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      cpf_cnpj TEXT,
      address TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      clientName TEXT,
      name TEXT,
      type TEXT,
      address TEXT,
      start_date TEXT,
      due_date TEXT,
      status TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      totalValue REAL,
      paidValue REAL,
      projectStyle TEXT,
      detailedStages TEXT,
      phases TEXT,
      files TEXT,
      tasks TEXT,
      payments TEXT,
      contracts TEXT,
      appointments TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      potentialClientName TEXT,
      contactEmail TEXT,
      contactPhone TEXT,
      projectDescription TEXT,
      status TEXT,
      source TEXT,
      estimatedValue REAL,
      nextActionDate TEXT,
      notes TEXT,
      costSimulationId TEXT,
      responsibleUserId TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS office_cost_configs (
      id TEXT PRIMARY KEY,
      name TEXT,
      monthlyBaseValue REAL,
      isArchived INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS team_member_configs (
      id TEXT PRIMARY KEY,
      name TEXT,
      role TEXT,
      hourlyRate REAL,
      isArchived INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cost_simulations (
      id TEXT PRIMARY KEY,
      leadId TEXT,
      data TEXT,
      isArchived INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      avatarUrl TEXT,
      hourlyRate REAL,
      isArchived INTEGER DEFAULT 0
    );
  `);

  // Seed demo admin user if it doesn't exist
  const count = db
    .prepare('SELECT COUNT(*) as count FROM users WHERE email = ?')
    .get('demo@dev.com').count;
  if (count === 0) {
    db.prepare(
      'INSERT INTO users (id, name, email, password, role) VALUES (@id, @name, @email, @password, @role)'
    ).run({
      id: 'user-admin',
      name: 'Demo Admin',
      email: 'demo@dev.com',
      password: 'demopass',
      role: 'admin'
    });
  }
}

export default db;
