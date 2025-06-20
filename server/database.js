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
  `);
}

export default db;
