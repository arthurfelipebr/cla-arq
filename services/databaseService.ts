import { Client, Project, Lead, CostSimulation, OfficeCostConfigItem, TeamMemberConfigItem, User as TeamUser } from '../types';
import { DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE, DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE, MOCK_TEAM_MEMBERS } from '../constants';

// Allow overriding the API base URL so the frontend can talk to a remote server
// when running on a different host. Falls back to relative `/api` for local dev.
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const fetchJSON = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

const recordExists = async (endpoint: string, id: string): Promise<boolean> => {
  const items: any[] = await fetchJSON(`${API_BASE}/${endpoint}`);
  return items.some(i => i.id === id);
};

// --- Client CRUD ---
export const getClients = async (): Promise<Client[]> => fetchJSON(`${API_BASE}/clients`);
export const addClient = async (client: Client): Promise<void> => {
  await fetchJSON(`${API_BASE}/clients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(client) });
};
export const updateClient = async (client: Client): Promise<void> => {
  await fetchJSON(`${API_BASE}/clients/${client.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(client) });
};
export const deleteClient = async (clientId: string): Promise<void> => {
  await fetchJSON(`${API_BASE}/clients/${clientId}`, { method: 'DELETE' });
};

// --- Project CRUD ---
export const getProjects = async (): Promise<Project[]> => fetchJSON(`${API_BASE}/projects`);
export const addProject = async (project: Project): Promise<void> => {
  await fetchJSON(`${API_BASE}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) });
};
export const updateProject = async (project: Project): Promise<void> => {
  await fetchJSON(`${API_BASE}/projects/${project.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) });
};
export const deleteProject = async (projectId: string): Promise<void> => {
  await fetchJSON(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' });
};

// --- Lead CRUD ---
export const getLeads = async (): Promise<Lead[]> => fetchJSON(`${API_BASE}/leads`);
export const addLead = async (lead: Lead): Promise<void> => {
  await fetchJSON(`${API_BASE}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
};
export const updateLead = async (lead: Lead): Promise<void> => {
  await fetchJSON(`${API_BASE}/leads/${lead.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
};
export const deleteLead = async (leadId: string): Promise<void> => {
  await fetchJSON(`${API_BASE}/leads/${leadId}`, { method: 'DELETE' });
};

// --- CostSimulation CRUD (placeholders) ---
export const getCostSimulations = async (): Promise<CostSimulation[]> =>
  fetchJSON(`${API_BASE}/cost_simulations`);

export const addOrUpdateCostSimulation = async (sim: CostSimulation): Promise<void> => {
  const exists = await recordExists('cost_simulations', sim.id);
  const url = exists ? `${API_BASE}/cost_simulations/${sim.id}` : `${API_BASE}/cost_simulations`;
  const method = exists ? 'PUT' : 'POST';
  await fetchJSON(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sim)
  });
};

// --- OfficeCostConfig CRUD (uses constants for now) ---
export const getOfficeCostConfigs = async (): Promise<OfficeCostConfigItem[]> =>
  fetchJSON(`${API_BASE}/office_cost_configs`);

export const addOrUpdateOfficeCostConfig = async (config: OfficeCostConfigItem): Promise<void> => {
  const exists = await recordExists('office_cost_configs', config.id);
  const url = exists ? `${API_BASE}/office_cost_configs/${config.id}` : `${API_BASE}/office_cost_configs`;
  const method = exists ? 'PUT' : 'POST';
  await fetchJSON(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
};

export const deleteOfficeCostConfig = async (id: string): Promise<void> => {
  await fetchJSON(`${API_BASE}/office_cost_configs/${id}`, { method: 'DELETE' });
};

// --- TeamMemberConfig CRUD (uses constants for now) ---
export const getTeamMemberConfigs = async (): Promise<TeamMemberConfigItem[]> =>
  fetchJSON(`${API_BASE}/team_member_configs`);

export const addOrUpdateTeamMemberConfig = async (config: TeamMemberConfigItem): Promise<void> => {
  const exists = await recordExists('team_member_configs', config.id);
  const url = exists ? `${API_BASE}/team_member_configs/${config.id}` : `${API_BASE}/team_member_configs`;
  const method = exists ? 'PUT' : 'POST';
  await fetchJSON(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
};

export const deleteTeamMemberConfig = async (id: string): Promise<void> => {
  await fetchJSON(`${API_BASE}/team_member_configs/${id}`, { method: 'DELETE' });
};

// --- TeamUser CRUD ---
export const getTeamUsers = async (): Promise<TeamUser[]> => MOCK_TEAM_MEMBERS;
export const addOrUpdateTeamUser = async (_user: TeamUser): Promise<void> => { /* not implemented */ };

export const initDB = async (): Promise<boolean> => true;
