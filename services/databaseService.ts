
import initSqlJs from 'sql.js';
import { 
  Client, Project, Lead, CostSimulation, OfficeCostConfigItem, 
  TeamMemberConfigItem, User as TeamUser, ProjectPhase, ProjectFile, 
  Task, Payment, Contract, Appointment, ProjectStage 
} from '../types';
import { 
  MOCK_CLIENTS, MOCK_PROJECTS, MOCK_LEADS, DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE, 
  DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE, MOCK_TEAM_MEMBERS 
} from '../constants'; // Assuming MOCK_COST_SIMULATIONS doesn't exist yet or is empty

// Variable to hold the SQL.js database instance
let db: initSqlJs.Database | null = null;
let SQL: initSqlJs.SqlJsStatic | null = null;

const DB_NAME = 'clarissa_dario_gestao.sqlite';

// Helper to get SQL.js wasm file
const locateFile = (file: string) => `https://esm.sh/sql.js@1.10.3/dist/${file}`;

// Helper to safely parse JSON
const safeJsonParse = (jsonString: string | null | undefined, defaultValue: any = null) => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", e, jsonString);
    return defaultValue;
  }
};

// Helper to stringify JSON
const safeJsonStringify = (value: any, defaultValue: string = '[]') => {
  try {
    return JSON.stringify(value);
  } catch (e) {
    console.error("Failed to stringify JSON:", e, value);
    return defaultValue;
  }
};


export const initDB = async (): Promise<boolean> => {
  try {
    if (!SQL) {
      SQL = await initSqlJs({ locateFile });
    }
    const storedDb = localStorage.getItem(DB_NAME);
    if (storedDb) {
      const dbArray = Uint8Array.from(JSON.parse(storedDb));
      db = new SQL.Database(dbArray);
      console.log("Database loaded from localStorage.");
    } else {
      db = new SQL.Database();
      console.log("New database created. Seeding data...");
      createSchema();
      seedData();
      saveDB(); // Save after initial setup
    }
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

const createSchema = () => {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, cpf_cnpj TEXT,
      address TEXT, notes TEXT, createdAt TEXT, updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, client_id TEXT, clientName TEXT, name TEXT, type TEXT,
      address TEXT, start_date TEXT, due_date TEXT, status TEXT, notes TEXT,
      createdAt TEXT, updatedAt TEXT, totalValue REAL, paidValue REAL,
      projectStyle TEXT, detailedStages TEXT, phases TEXT, files TEXT, 
      tasks TEXT, payments TEXT, contracts TEXT, appointments TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, potentialClientName TEXT, contactEmail TEXT, contactPhone TEXT,
      projectDescription TEXT, status TEXT, source TEXT, estimatedValue REAL,
      nextActionDate TEXT, notes TEXT, costSimulationId TEXT, responsibleUserId TEXT,
      createdAt TEXT, updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS cost_simulations (
      id TEXT PRIMARY KEY, leadId TEXT, projectDurationMonths INTEGER,
      simulatedOfficeFixedCosts TEXT, simulatedProjectVariableCosts TEXT,
      simulatedTeamCosts TEXT, simulatedComplexityFactors TEXT,
      profitMarginPercentage REAL, negotiationMarginPercentage REAL, taxPercentage REAL,
      discountPercentage REAL, subtotalOfficeFixedCostsProRata REAL,
      calculatedOfficeFixedCostsContribution REAL, subtotalProjectVariableCosts REAL,
      subtotalTeamCosts REAL, subtotalDirectCosts REAL, totalComplexityValue REAL,
      costWithComplexity REAL, profitValue REAL, costPlusProfit REAL,
      negotiationValue REAL, costPlusProfitAndNegotiation REAL, discountValue REAL,
      finalValueBeforeTaxAfterDiscount REAL, taxValue REAL, finalProposedValue REAL,
      finalProposedValueWithDiscount REAL, createdAt TEXT, updatedAt TEXT,
      projectStyle TEXT, detailedStages TEXT,
      FOREIGN KEY (leadId) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS office_cost_configs (
      id TEXT PRIMARY KEY, name TEXT, monthlyBaseValue REAL, isArchived INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS team_member_configs (
      id TEXT PRIMARY KEY, name TEXT, role TEXT, hourlyRate REAL, isArchived INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS team_users (
      id TEXT PRIMARY KEY, name TEXT, email TEXT, avatarUrl TEXT, role TEXT, hourlyRate REAL
    );
  `);
  console.log("Database schema created.");
};

const seedData = () => {
  if (!db) return;
  console.log("Seeding initial data...");

  // Seed Clients
  MOCK_CLIENTS.forEach(client => {
    db!.run(
      "INSERT INTO clients (id, name, email, phone, cpf_cnpj, address, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [client.id, client.name, client.email, client.phone, client.cpf_cnpj, client.address, client.notes, client.createdAt, client.updatedAt]
    );
  });

  // Seed Projects
  MOCK_PROJECTS.forEach(project => {
    db!.run(
      "INSERT INTO projects (id, client_id, clientName, name, type, address, start_date, due_date, status, notes, createdAt, updatedAt, totalValue, paidValue, projectStyle, detailedStages, phases, files, tasks, payments, contracts, appointments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        project.id, project.client_id, project.clientName, project.name, project.type, project.address,
        project.start_date, project.due_date, project.status, project.notes, project.createdAt,
        project.updatedAt, project.totalValue, project.paidValue, project.projectStyle,
        safeJsonStringify(project.detailedStages), safeJsonStringify(project.phases),
        safeJsonStringify(project.files), safeJsonStringify(project.tasks),
        safeJsonStringify(project.payments), safeJsonStringify(project.contracts),
        safeJsonStringify(project.appointments)
      ]
    );
  });
  
  // Seed Leads
   MOCK_LEADS.forEach(lead => {
    db!.run(
        "INSERT INTO leads (id, potentialClientName, contactEmail, contactPhone, projectDescription, status, source, estimatedValue, nextActionDate, notes, costSimulationId, responsibleUserId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [lead.id, lead.potentialClientName, lead.contactEmail, lead.contactPhone, lead.projectDescription, lead.status, lead.source, lead.estimatedValue, lead.nextActionDate, lead.notes, lead.costSimulationId, lead.responsibleUserId, lead.createdAt, lead.updatedAt]
    );
  });


  // Seed OfficeCostConfigs
  DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE.forEach(config => {
    db!.run(
      "INSERT INTO office_cost_configs (id, name, monthlyBaseValue, isArchived) VALUES (?, ?, ?, ?)",
      [config.id, config.name, config.monthlyBaseValue, config.isArchived ? 1 : 0]
    );
  });

  // Seed TeamMemberConfigs
  DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE.forEach(config => {
    db!.run(
      "INSERT INTO team_member_configs (id, name, role, hourlyRate, isArchived) VALUES (?, ?, ?, ?, ?)",
      [config.id, config.name, config.role, config.hourlyRate, config.isArchived ? 1 : 0]
    );
  });

  // Seed TeamUsers (MOCK_TEAM_MEMBERS)
  MOCK_TEAM_MEMBERS.forEach(user => {
    db!.run(
      "INSERT INTO team_users (id, name, email, avatarUrl, role, hourlyRate) VALUES (?, ?, ?, ?, ?, ?)",
      [user.id, user.name, user.email, user.avatarUrl, user.role, user.hourlyRate]
    );
  });

  console.log("Initial data seeded.");
};

export const saveDB = () => {
  if (!db) return;
  try {
    const data = db.export();
    localStorage.setItem(DB_NAME, JSON.stringify(Array.from(data)));
    console.log("Database saved to localStorage.");
  } catch (error) {
    console.error("Error saving database:", error);
  }
};

// --- Client CRUD ---
export const getClients = async (): Promise<Client[]> => {
  if (!db) await initDB(); // Ensure DB is initialized
  const results = db!.exec("SELECT * FROM clients ORDER BY name ASC");
  if (results.length === 0 || !results[0].values) return [];
  return results[0].values.map(row => ({
    id: row[0] as string, name: row[1] as string, email: row[2] as string, phone: row[3] as string,
    cpf_cnpj: row[4] as string, address: row[5] as string, notes: row[6] as string | undefined,
    createdAt: row[7] as string, updatedAt: row[8] as string,
  }));
};

export const addClient = async (client: Client): Promise<void> => {
  db!.run(
    "INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [client.id, client.name, client.email, client.phone, client.cpf_cnpj, client.address, client.notes, client.createdAt, client.updatedAt]
  );
  saveDB();
};

export const updateClient = async (client: Client): Promise<void> => {
  db!.run(
    "UPDATE clients SET name=?, email=?, phone=?, cpf_cnpj=?, address=?, notes=?, updatedAt=? WHERE id=?",
    [client.name, client.email, client.phone, client.cpf_cnpj, client.address, client.notes, client.updatedAt, client.id]
  );
  saveDB();
};

export const deleteClient = async (clientId: string): Promise<void> => {
  db!.run("DELETE FROM clients WHERE id=?", [clientId]);
  // Consider cascading deletes or warnings for related projects
  saveDB();
};

// --- Project CRUD ---
export const getProjects = async (): Promise<Project[]> => {
  if (!db) await initDB();
  const results = db!.exec("SELECT * FROM projects ORDER BY due_date ASC");
  if (results.length === 0 || !results[0].values) return [];
  return results[0].values.map(row => ({
    id: row[0] as string, client_id: row[1] as string, clientName: row[2] as string | undefined,
    name: row[3] as string, type: row[4] as any, address: row[5] as string,
    start_date: row[6] as string, due_date: row[7] as string, status: row[8] as any,
    notes: row[9] as string | undefined, createdAt: row[10] as string, updatedAt: row[11] as string,
    totalValue: row[12] as number | undefined, paidValue: row[13] as number | undefined,
    projectStyle: row[14] as string | undefined,
    detailedStages: safeJsonParse(row[15] as string, []) as ProjectStage[],
    phases: safeJsonParse(row[16] as string, []) as ProjectPhase[],
    files: safeJsonParse(row[17] as string, []) as ProjectFile[],
    tasks: safeJsonParse(row[18] as string, []) as Task[],
    payments: safeJsonParse(row[19] as string, []) as Payment[],
    contracts: safeJsonParse(row[20] as string, []) as Contract[],
    appointments: safeJsonParse(row[21] as string, []) as Appointment[],
  }));
};

export const addProject = async (project: Project): Promise<void> => {
  db!.run(
    "INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      project.id, project.client_id, project.clientName, project.name, project.type, project.address,
      project.start_date, project.due_date, project.status, project.notes, project.createdAt,
      project.updatedAt, project.totalValue, project.paidValue, project.projectStyle,
      safeJsonStringify(project.detailedStages), safeJsonStringify(project.phases),
      safeJsonStringify(project.files), safeJsonStringify(project.tasks),
      safeJsonStringify(project.payments), safeJsonStringify(project.contracts),
      safeJsonStringify(project.appointments)
    ]
  );
  saveDB();
};

export const updateProject = async (project: Project): Promise<void> => {
  db!.run(
    "UPDATE projects SET client_id=?, clientName=?, name=?, type=?, address=?, start_date=?, due_date=?, status=?, notes=?, updatedAt=?, totalValue=?, paidValue=?, projectStyle=?, detailedStages=?, phases=?, files=?, tasks=?, payments=?, contracts=?, appointments=? WHERE id=?",
    [
      project.client_id, project.clientName, project.name, project.type, project.address, project.start_date,
      project.due_date, project.status, project.notes, project.updatedAt, project.totalValue,
      project.paidValue, project.projectStyle,
      safeJsonStringify(project.detailedStages), safeJsonStringify(project.phases),
      safeJsonStringify(project.files), safeJsonStringify(project.tasks),
      safeJsonStringify(project.payments), safeJsonStringify(project.contracts),
      safeJsonStringify(project.appointments), project.id
    ]
  );
  saveDB();
};

export const deleteProject = async (projectId: string): Promise<void> => {
  db!.run("DELETE FROM projects WHERE id=?", [projectId]);
  saveDB();
};

// --- Lead CRUD ---
export const getLeads = async (): Promise<Lead[]> => {
    if (!db) await initDB();
    const results = db!.exec("SELECT * FROM leads ORDER BY createdAt DESC");
    if (results.length === 0 || !results[0].values) return [];
    return results[0].values.map(row => ({
        id: row[0] as string, potentialClientName: row[1] as string, contactEmail: row[2] as string | undefined,
        contactPhone: row[3] as string | undefined, projectDescription: row[4] as string, status: row[5] as any,
        source: row[6] as any | undefined, estimatedValue: row[7] as number | undefined,
        nextActionDate: row[8] as string | undefined, notes: row[9] as string | undefined,
        costSimulationId: row[10] as string | undefined, responsibleUserId: row[11] as string | undefined,
        createdAt: row[12] as string, updatedAt: row[13] as string,
    }));
};
export const addLead = async (lead: Lead): Promise<void> => {
    db!.run("INSERT INTO leads VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [lead.id, lead.potentialClientName, lead.contactEmail, lead.contactPhone, lead.projectDescription, lead.status, lead.source, lead.estimatedValue, lead.nextActionDate, lead.notes, lead.costSimulationId, lead.responsibleUserId, lead.createdAt, lead.updatedAt]
    );
    saveDB();
};
export const updateLead = async (lead: Lead): Promise<void> => {
    db!.run("UPDATE leads SET potentialClientName=?, contactEmail=?, contactPhone=?, projectDescription=?, status=?, source=?, estimatedValue=?, nextActionDate=?, notes=?, costSimulationId=?, responsibleUserId=?, updatedAt=? WHERE id=?",
        [lead.potentialClientName, lead.contactEmail, lead.contactPhone, lead.projectDescription, lead.status, lead.source, lead.estimatedValue, lead.nextActionDate, lead.notes, lead.costSimulationId, lead.responsibleUserId, lead.updatedAt, lead.id]
    );
    saveDB();
};
export const deleteLead = async (leadId: string): Promise<void> => {
    db!.run("DELETE FROM leads WHERE id=?", [leadId]);
    db!.run("DELETE FROM cost_simulations WHERE leadId=?", [leadId]); // Cascade delete simulation
    saveDB();
};

// --- CostSimulation CRUD ---
export const getCostSimulations = async (): Promise<CostSimulation[]> => {
    if (!db) await initDB();
    const results = db!.exec("SELECT * FROM cost_simulations");
    if (results.length === 0 || !results[0].values) return [];
    return results[0].values.map(row => ({
        id: row[0] as string, leadId: row[1] as string, projectDurationMonths: row[2] as number,
        simulatedOfficeFixedCosts: safeJsonParse(row[3] as string, []),
        simulatedProjectVariableCosts: safeJsonParse(row[4] as string, []),
        simulatedTeamCosts: safeJsonParse(row[5] as string, []), // Kept for schema, but might be empty if detailedStages is primary
        simulatedComplexityFactors: safeJsonParse(row[6] as string, []),
        profitMarginPercentage: row[7] as number, negotiationMarginPercentage: row[8] as number,
        taxPercentage: row[9] as number, discountPercentage: row[10] as number | undefined,
        subtotalOfficeFixedCostsProRata: row[11] as number,
        calculatedOfficeFixedCostsContribution: row[12] as number | undefined,
        subtotalProjectVariableCosts: row[13] as number, subtotalTeamCosts: row[14] as number,
        subtotalDirectCosts: row[15] as number, totalComplexityValue: row[16] as number,
        costWithComplexity: row[17] as number, profitValue: row[18] as number,
        costPlusProfit: row[19] as number, negotiationValue: row[20] as number,
        costPlusProfitAndNegotiation: row[21] as number, discountValue: row[22] as number | undefined,
        finalValueBeforeTaxAfterDiscount: row[23] as number | undefined, taxValue: row[24] as number,
        finalProposedValue: row[25] as number, finalProposedValueWithDiscount: row[26] as number | undefined,
        createdAt: row[27] as string, updatedAt: row[28] as string,
        projectStyle: row[29] as string | undefined, detailedStages: safeJsonParse(row[30] as string, []),
    }));
};
export const addOrUpdateCostSimulation = async (simulation: CostSimulation): Promise<void> => {
    const existing = db!.exec("SELECT id FROM cost_simulations WHERE id=?", [simulation.id]);
    if (existing.length > 0 && existing[0].values && existing[0].values.length > 0) {
        // Update
        db!.run("UPDATE cost_simulations SET leadId=?, projectDurationMonths=?, simulatedOfficeFixedCosts=?, simulatedProjectVariableCosts=?, simulatedTeamCosts=?, simulatedComplexityFactors=?, profitMarginPercentage=?, negotiationMarginPercentage=?, taxPercentage=?, discountPercentage=?, subtotalOfficeFixedCostsProRata=?, calculatedOfficeFixedCostsContribution=?, subtotalProjectVariableCosts=?, subtotalTeamCosts=?, subtotalDirectCosts=?, totalComplexityValue=?, costWithComplexity=?, profitValue=?, costPlusProfit=?, negotiationValue=?, costPlusProfitAndNegotiation=?, discountValue=?, finalValueBeforeTaxAfterDiscount=?, taxValue=?, finalProposedValue=?, finalProposedValueWithDiscount=?, updatedAt=?, projectStyle=?, detailedStages=? WHERE id=?",
            [simulation.leadId, simulation.projectDurationMonths, safeJsonStringify(simulation.simulatedOfficeFixedCosts), safeJsonStringify(simulation.simulatedProjectVariableCosts), safeJsonStringify(simulation.simulatedTeamCosts), safeJsonStringify(simulation.simulatedComplexityFactors), simulation.profitMarginPercentage, simulation.negotiationMarginPercentage, simulation.taxPercentage, simulation.discountPercentage, simulation.subtotalOfficeFixedCostsProRata, simulation.calculatedOfficeFixedCostsContribution, simulation.subtotalProjectVariableCosts, simulation.subtotalTeamCosts, simulation.subtotalDirectCosts, simulation.totalComplexityValue, simulation.costWithComplexity, simulation.profitValue, simulation.costPlusProfit, simulation.negotiationValue, simulation.costPlusProfitAndNegotiation, simulation.discountValue, simulation.finalValueBeforeTaxAfterDiscount, simulation.taxValue, simulation.finalProposedValue, simulation.finalProposedValueWithDiscount, simulation.updatedAt, simulation.projectStyle, safeJsonStringify(simulation.detailedStages), simulation.id]
        );
    } else {
        // Insert
        db!.run("INSERT INTO cost_simulations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [simulation.id, simulation.leadId, simulation.projectDurationMonths, safeJsonStringify(simulation.simulatedOfficeFixedCosts), safeJsonStringify(simulation.simulatedProjectVariableCosts), safeJsonStringify(simulation.simulatedTeamCosts), safeJsonStringify(simulation.simulatedComplexityFactors), simulation.profitMarginPercentage, simulation.negotiationMarginPercentage, simulation.taxPercentage, simulation.discountPercentage, simulation.subtotalOfficeFixedCostsProRata, simulation.calculatedOfficeFixedCostsContribution, simulation.subtotalProjectVariableCosts, simulation.subtotalTeamCosts, simulation.subtotalDirectCosts, simulation.totalComplexityValue, simulation.costWithComplexity, simulation.profitValue, simulation.costPlusProfit, simulation.negotiationValue, simulation.costPlusProfitAndNegotiation, simulation.discountValue, simulation.finalValueBeforeTaxAfterDiscount, simulation.taxValue, simulation.finalProposedValue, simulation.finalProposedValueWithDiscount, simulation.createdAt, simulation.updatedAt, simulation.projectStyle, safeJsonStringify(simulation.detailedStages)]
        );
    }
    saveDB();
};

// --- OfficeCostConfig CRUD ---
export const getOfficeCostConfigs = async (): Promise<OfficeCostConfigItem[]> => {
  if (!db) await initDB();
  const results = db!.exec("SELECT * FROM office_cost_configs WHERE isArchived = 0 ORDER BY name ASC");
  if (results.length === 0 || !results[0].values) return [];
  return results[0].values.map(row => ({
    id: row[0] as string, name: row[1] as string, monthlyBaseValue: row[2] as number,
    isArchived: (row[3] as number) === 1,
  }));
};
export const addOrUpdateOfficeCostConfig = async (config: OfficeCostConfigItem): Promise<void> => {
  const existing = db!.exec("SELECT id FROM office_cost_configs WHERE id=?", [config.id]);
  if (existing.length > 0 && existing[0].values && existing[0].values.length > 0) {
    db!.run("UPDATE office_cost_configs SET name=?, monthlyBaseValue=?, isArchived=? WHERE id=?",
      [config.name, config.monthlyBaseValue, config.isArchived ? 1 : 0, config.id]);
  } else {
    db!.run("INSERT INTO office_cost_configs VALUES (?, ?, ?, ?)",
      [config.id, config.name, config.monthlyBaseValue, config.isArchived ? 1 : 0]);
  }
  saveDB();
};
export const deleteOfficeCostConfig = async (id: string): Promise<void> => {
    // Soft delete by archiving, or hard delete if preferred
    db!.run("UPDATE office_cost_configs SET isArchived=1 WHERE id=?", [id]);
    // db!.run("DELETE FROM office_cost_configs WHERE id=?", [id]); // for hard delete
    saveDB();
};

// --- TeamMemberConfig CRUD ---
export const getTeamMemberConfigs = async (): Promise<TeamMemberConfigItem[]> => {
  if (!db) await initDB();
  const results = db!.exec("SELECT * FROM team_member_configs WHERE isArchived = 0 ORDER BY name ASC");
  if (results.length === 0 || !results[0].values) return [];
  return results[0].values.map(row => ({
    id: row[0] as string, name: row[1] as string, role: row[2] as string,
    hourlyRate: row[3] as number, isArchived: (row[4] as number) === 1,
  }));
};
export const addOrUpdateTeamMemberConfig = async (config: TeamMemberConfigItem): Promise<void> => {
  const existing = db!.exec("SELECT id FROM team_member_configs WHERE id=?", [config.id]);
  if (existing.length > 0 && existing[0].values && existing[0].values.length > 0) {
    db!.run("UPDATE team_member_configs SET name=?, role=?, hourlyRate=?, isArchived=? WHERE id=?",
      [config.name, config.role, config.hourlyRate, config.isArchived ? 1 : 0, config.id]);
  } else {
    db!.run("INSERT INTO team_member_configs VALUES (?, ?, ?, ?, ?)",
      [config.id, config.name, config.role, config.hourlyRate, config.isArchived ? 1 : 0]);
  }
  saveDB();
};
export const deleteTeamMemberConfig = async (id: string): Promise<void> => {
    db!.run("UPDATE team_member_configs SET isArchived=1 WHERE id=?", [id]);
    saveDB();
};

// --- TeamUser CRUD (for MOCK_TEAM_MEMBERS) ---
export const getTeamUsers = async (): Promise<TeamUser[]> => {
  if (!db) await initDB();
  const results = db!.exec("SELECT * FROM team_users ORDER BY name ASC");
  if (results.length === 0 || !results[0].values) return [];
  return results[0].values.map(row => ({
    id: row[0] as string, name: row[1] as string, email: row[2] as string,
    avatarUrl: row[3] as string | undefined, role: row[4] as string | undefined,
    hourlyRate: row[5] as number | undefined,
  }));
};
export const addOrUpdateTeamUser = async (user: TeamUser): Promise<void> => {
  const existing = db!.exec("SELECT id FROM team_users WHERE id=?", [user.id]);
  if (existing.length > 0 && existing[0].values && existing[0].values.length > 0) {
    db!.run("UPDATE team_users SET name=?, email=?, avatarUrl=?, role=?, hourlyRate=? WHERE id=?",
      [user.name, user.email, user.avatarUrl, user.role, user.hourlyRate, user.id]);
  } else {
    db!.run("INSERT INTO team_users VALUES (?, ?, ?, ?, ?, ?)",
      [user.id, user.name, user.email, user.avatarUrl, user.role, user.hourlyRate]);
  }
  saveDB();
};

// For now, no delete for team_users as they are linked to configs.
// To delete a team_user, one might also delete the corresponding team_member_config.
