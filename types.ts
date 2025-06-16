import { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  exact?: boolean; // For active link matching
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf_cnpj: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectType {
  RESIDENTIAL = 'Residencial',
  COMMERCIAL = 'Comercial',
  INTERIOR = 'Interiores',
  CONSULTANCY = 'Consultoria',
  REPORT = 'Laudo',
}

export enum ProjectStatus {
  PLANNING = 'Planejamento',
  ONGOING = 'Em Andamento',
  COMPLETED = 'Concluído',
  ON_HOLD = 'Em Espera',
  CANCELED = 'Cancelado',
}

export interface ProjectSubPhase {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

export interface ProjectPhase {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  due_date?: string;
  subPhases?: ProjectSubPhase[];
}

export interface ProjectFile {
  id: string;
  name: string;
  file_url: string;
  uploaded_at: string;
  file_type?: string; 
  size?: number; 
  uploaded_by?: string; 
}

export enum PaymentMethod {
  BANK_TRANSFER = 'Transferência Bancária',
  CREDIT_CARD = 'Cartão de Crédito',
  PIX = 'PIX',
  CASH = 'Dinheiro',
}

export interface ProjectAddendum {
  id: string;
  description: string;
  signed_at: string;
  file_url: string;
  value_change?: number; 
}

export interface Contract {
  id: string;
  project_id?: string; 
  title: string; 
  signed_at: string;
  file_url: string;
  value: number;
  payment_method: PaymentMethod;
  notes?: string;
  addendums?: ProjectAddendum[];
}

export enum PaymentStatus {
  PENDING = 'Pendente',
  PAID = 'Pago',
  OVERDUE = 'Vencido',
}

export interface Payment {
  id:string;
  project_id?: string; 
  description: string;
  due_date: string;
  value: number;
  status: PaymentStatus;
  payment_date?: string;
  notes?: string;
  // For FinancesPage aggregation
  projectName?: string; 
  clientName?: string;
}

export enum TaskStatus {
  TO_DO = 'A Fazer',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  BLOCKED = 'Bloqueada',
}

export interface Task {
  id: string;
  projectId?: string; // Explicitly for linking to a project
  project_id?: string; // Keep for compatibility if used elsewhere, prefer projectId
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  responsible?: string; 
  priority?: 'Baixa' | 'Média' | 'Alta';
  order?: number; // For Kanban ordering within a column
  projectName?: string; // Denormalized for display in global lists
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}


export enum AppointmentType {
  GENERAL = 'Geral',
  PROJECT_MEETING = 'Reunião de Projeto',
  TASK_DEADLINE = 'Prazo de Tarefa',
  INSPECTION_SCHEDULED = 'Inspeção Agendada',
  PAYMENT_DUE = 'Vencimento de Pagamento',
}

export interface Appointment {
  id: string;
  projectId?: string; 
  title: string;
  location?: string;
  date_time: string; // Should be ISO string
  end_date_time?: string; // Optional end time for duration
  notes?: string;
  attendees?: string[]; 
  type: AppointmentType;
  relatedId?: string; // ID of related Task, Inspection, Payment, etc.
  isAllDay?: boolean;
}

// New types for detailed pricing stages
export interface ProjectStageItem {
  id: string;
  name: string;
  responsibleId?: string;
  hours?: number;
}

export interface ProjectStage {
  id: string;
  name: string;
  items: ProjectStageItem[];
  isCollapsed?: boolean;
}

export interface Project {
  id: string;
  client_id: string;
  client?: Client; 
  clientName?: string; 
  name: string;
  type: ProjectType;
  address: string;
  start_date: string;
  due_date: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalValue?: number;
  paidValue?: number;
  remainingValue?: number; 

  phases?: ProjectPhase[];
  files?: ProjectFile[];
  tasks?: Task[]; // Project-specific tasks
  payments?: Payment[];
  contracts?: Contract[];
  appointments?: Appointment[]; // Project-specific appointments
  
  projectStyle?: string; // For "Estilo do projeto"
  detailedStages?: ProjectStage[]; // For detailed pricing
}


export enum InspectionStatus {
  SCHEDULED = 'Agendado',
  IN_PROGRESS = 'Em Andamento',
  REPORT_PENDING = 'Laudo Pendente',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado',
}

export enum InspectionType {
  PROPERTY_VALUATION = 'Avaliação de Imóvel',
  STRUCTURAL_INSPECTION = 'Inspeção Estrutural',
  PRE_PURCHASE_INSPECTION = 'Inspeção Pré-Compra',
  OTHER = 'Outro',
}

export interface Inspection {
  id: string;
  client_id: string;
  client?: Client; 
  clientName?: string; // Denormalized for display
  identifier: string; 
  inspection_type: InspectionType;
  status: InspectionStatus;
  channel?: string; 
  bank?: string;
  cost_center?: string;
  address: string;
  scheduled_date: string;
  due_date: string; 
  sla_limit?: string; 
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionFile {
  id: string;
  inspection_id: string;
  filename: string;
  file_url: string;
  uploaded_at: string;
  file_type?: string;
  size?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string; // For team members
  hourlyRate?: number; // For team members
}

// For charts
export interface MonthlyData {
  month: string; // e.g., "Jan/24"
  value: number; // Can be revenue, expenses, profit
}

export interface StatusDistribution {
  name: ProjectStatus | InspectionStatus | TaskStatus | PaymentStatus;
  value: number;
  color?: string; // Optional color for chart segments
}

export interface DateBasedChartEntry {
    date: string; // YYYY-MM-DD for grouping
    count: number;
}

// CRM Types
export enum LeadStatus {
  NEW = 'Novo',
  CONTACTED = 'Contatado',
  PROPOSAL_SENT = 'Proposta Enviada',
  NEGOTIATION = 'Em Negociação',
  WON = 'Ganha',
  LOST = 'Perdida',
  ARCHIVED = 'Arquivado',
}

export enum LeadSource {
  REFERRAL = 'Indicação',
  WEBSITE = 'Website',
  SOCIAL_MEDIA = 'Redes Sociais',
  EVENT = 'Evento',
  OTHER = 'Outro',
}

export interface Lead {
  id: string;
  potentialClientName: string;
  contactEmail?: string;
  contactPhone?: string;
  projectDescription: string;
  status: LeadStatus;
  source?: LeadSource;
  estimatedValue?: number;
  nextActionDate?: string; // ISO Date string
  notes?: string;
  costSimulationId?: string; // Link to a cost simulation object
  responsibleUserId?: string; // ID of the User responsible for this lead
  createdAt: string; // ISO DateTime string
  updatedAt: string; // ISO DateTime string
}

export type CostItemType = 'OFFICE_FIXED' | 'PROJECT_VARIABLE' | 'TEAM';
export type CostItemUnit = 'monthly' | 'project_specific' | 'hourly' | 'unit';


export interface CostItem {
  id: string; // Can be from template or custom
  configItemId?: string; // If derived from a OfficeCostConfigItem or TeamMemberConfigItem
  name: string; 
  type: CostItemType;
  unit: CostItemUnit; 
  baseValue: number; // Monthly for office_fixed, per unit for variable, hourly for team
  quantity: number; // Months for pro-rata office_fixed, units for variable, hours for team
  calculatedCost: number; 
  isApplied?: boolean; // For office_fixed from settings, user can choose to apply it or not to this simulation
  isDefault?: boolean; // From original template
  editable?: boolean; // If name/baseValue can be edited in simulation
}

export interface ComplexityFactorItem {
  id: string;
  name: string;
  percentage: number; // e.g., 10 for 10%
  isApplied?: boolean; // User can choose to apply it or not
}

export interface CostSimulation {
  id: string;
  leadId: string; // Link back to the Lead
  projectDurationMonths: number;
  // Cost items are stored with their state at the time of simulation
  simulatedOfficeFixedCosts: CostItem[]; 
  simulatedProjectVariableCosts: CostItem[];
  simulatedTeamCosts: CostItem[]; // This might be replaced/supplemented by detailedStages
  simulatedComplexityFactors: ComplexityFactorItem[];
  
  profitMarginPercentage: number; 
  negotiationMarginPercentage: number; 
  taxPercentage: number; 
  discountPercentage?: number;
  
  // Calculated fields (updated whenever an input changes)
  subtotalOfficeFixedCostsProRata: number; 
  calculatedOfficeFixedCostsContribution?: number; // 15% of subtotalOfficeFixedCostsProRata for direct cost calculation
  subtotalProjectVariableCosts: number;
  subtotalTeamCosts: number; 
  subtotalDirectCosts: number; 
  
  totalComplexityValue: number;
  costWithComplexity: number; 
  
  profitValue: number;
  costPlusProfit: number; 
  
  negotiationValue: number;
  costPlusProfitAndNegotiation: number;
  
  discountValue?: number; 
  finalValueBeforeTaxAfterDiscount?: number; 

  taxValue: number; 
  finalProposedValue: number; // This will be costPlusProfitAndNegotiation + taxValue (or finalValueBeforeTaxAfterDiscount + newTaxValue if discount applied)
  finalProposedValueWithDiscount?: number; // Explicit field for clarity, this becomes the primary "finalProposedValue" for the user.
  
  createdAt: string; 
  updatedAt: string; 

  projectStyle?: string; 
  detailedStages?: ProjectStage[]; 
}

// Configurable items in Settings
export interface OfficeCostConfigItem {
  id: string;
  name: string;
  monthlyBaseValue: number;
  isArchived?: boolean; // To hide from new simulations without deleting history
}

export interface TeamMemberConfigItem {
  id: string; // Can be user ID
  name: string;
  role: string;
  hourlyRate: number;
  isArchived?: boolean; // To hide from new simulations
}