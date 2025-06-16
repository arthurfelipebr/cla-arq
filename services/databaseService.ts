import { Client, Project, Lead, CostSimulation, OfficeCostConfigItem, TeamMemberConfigItem, User as TeamUser } from '../types';
import { DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE, DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE, MOCK_TEAM_MEMBERS } from '../constants';

const API_BASE = '/api';

const fetchJSON = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
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
export const getCostSimulations = async (): Promise<CostSimulation[]> => [];
export const addOrUpdateCostSimulation = async (_sim: CostSimulation): Promise<void> => { /* not implemented */ };

// --- OfficeCostConfig CRUD (uses constants for now) ---
export const getOfficeCostConfigs = async (): Promise<OfficeCostConfigItem[]> => DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE;
export const addOrUpdateOfficeCostConfig = async (_config: OfficeCostConfigItem): Promise<void> => { /* not implemented */ };
export const deleteOfficeCostConfig = async (_id: string): Promise<void> => { /* not implemented */ };

// --- TeamMemberConfig CRUD (uses constants for now) ---
export const getTeamMemberConfigs = async (): Promise<TeamMemberConfigItem[]> => DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE;
export const addOrUpdateTeamMemberConfig = async (_config: TeamMemberConfigItem): Promise<void> => { /* not implemented */ };
export const deleteTeamMemberConfig = async (_id: string): Promise<void> => { /* not implemented */ };

// --- TeamUser CRUD ---
export const getTeamUsers = async (): Promise<TeamUser[]> => MOCK_TEAM_MEMBERS;
export const addOrUpdateTeamUser = async (_user: TeamUser): Promise<void> => { /* not implemented */ };

export const initDB = async (): Promise<boolean> => true;
