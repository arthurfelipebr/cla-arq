import { NavItem, Project, ProjectStatus, ProjectType, TaskStatus, InspectionStatus, InspectionType, PaymentStatus, Client, ProjectPhase, ProjectFile, Task, Payment, Contract, Appointment, PaymentMethod, ProjectSubPhase, KanbanColumn, AppointmentType, User, Lead, LeadStatus, LeadSource, CostItem, ComplexityFactorItem, Inspection, OfficeCostConfigItem, TeamMemberConfigItem, ProjectStage, ProjectStageItem } from './types';
import { Home, Briefcase, Users, FileText, DollarSign, ListChecks, CalendarDays, Settings, ShieldQuestion, LogOut, CheckSquare, GanttChartSquare, Landmark, SearchCode, Lightbulb, Users2, Building, BarChart3, Copy } from 'lucide-react'; // Added Lightbulb, Users2, Building, BarChart3, Copy

export const API_BASE_URL = '/api'; // Mock API base URL

export const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home, exact: true },
  { name: 'Projetos', href: '/projects', icon: Briefcase },
  { name: 'Oportunidades (CRM)', href: '/crm', icon: Lightbulb }, 
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Inspeções', href: '/inspections', icon: SearchCode }, 
  { name: 'Financeiro', href: '/finances', icon: DollarSign },
  { name: 'Tarefas', href: '/tasks', icon: ListChecks },
  { name: 'Agenda', href: '/calendar', icon: CalendarDays },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Ajuda', href: '/help', icon: ShieldQuestion },
    { name: 'Sair', href: '#logout', icon: LogOut },
];

export const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus);
export const PROJECT_TYPE_OPTIONS = Object.values(ProjectType);
export const TASK_STATUS_OPTIONS = Object.values(TaskStatus);
export const TASK_PRIORITY_OPTIONS: Array<'Baixa' | 'Média' | 'Alta'> = ['Baixa', 'Média', 'Alta'];
export const INSPECTION_STATUS_OPTIONS = Object.values(InspectionStatus);
export const INSPECTION_TYPE_OPTIONS = Object.values(InspectionType);
export const PAYMENT_STATUS_OPTIONS = Object.values(PaymentStatus);
export const PAYMENT_METHOD_OPTIONS = Object.values(PaymentMethod);
export const APPOINTMENT_TYPE_OPTIONS = Object.values(AppointmentType);
export const LEAD_STATUS_OPTIONS = Object.values(LeadStatus);
export const LEAD_SOURCE_OPTIONS = Object.values(LeadSource);
export const PROJECT_STYLE_OPTIONS: string[] = ['Padrão', 'Luxo', 'Comercial Simplificado', 'Consultoria Express'];


export const STATUS_COLORS: Record<string, string> = {
  [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-700',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-700',
  [ProjectStatus.ONGOING]: 'bg-sky-100 text-sky-700', 
  [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-700', 
  [ProjectStatus.CANCELED]: 'bg-red-100 text-red-700', 
  
  [TaskStatus.TO_DO]: 'bg-gray-100 text-gray-700',
  [TaskStatus.BLOCKED]: 'bg-orange-100 text-orange-700',

  [InspectionStatus.SCHEDULED]: 'bg-indigo-100 text-indigo-700',
  [InspectionStatus.REPORT_PENDING]: 'bg-purple-100 text-purple-700',

  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-700',
  [PaymentStatus.OVERDUE]: 'bg-red-100 text-red-700 font-semibold',

  [LeadStatus.NEW]: 'bg-blue-100 text-blue-600',
  [LeadStatus.CONTACTED]: 'bg-cyan-100 text-cyan-600',
  [LeadStatus.PROPOSAL_SENT]: 'bg-purple-100 text-purple-600',
  [LeadStatus.NEGOTIATION]: 'bg-yellow-100 text-yellow-600',
  [LeadStatus.WON]: 'bg-green-100 text-green-600',
  [LeadStatus.LOST]: 'bg-red-100 text-red-600',
  [LeadStatus.ARCHIVED]: 'bg-gray-100 text-gray-600',

  'default': 'bg-gray-200 text-gray-800',
};


export const MOCK_USER: User = {
  id: 'user-clarissa',
  name: 'Clarissa Dario',
  email: 'clarissa.dario@arquitetura.com',
  avatarUrl: 'https://i.pravatar.cc/100?u=clarissa.dario',
  role: 'Arquiteta Principal',
  hourlyRate: 150 
};

export const MOCK_TEAM_MEMBERS: User[] = [
  MOCK_USER,
  { id: 'user-socio1', name: 'Sócio 01 (Ana)', email: 'socio1@arquitetura.com', role: 'Sócio Arquiteto', hourlyRate: 97.22, avatarUrl: 'https://i.pravatar.cc/100?u=socio1' },
  { id: 'user-socio2', name: 'Sócio 02 (Bruno)', email: 'socio2@arquitetura.com', role: 'Sócio Administrador', hourlyRate: 97.22, avatarUrl: 'https://i.pravatar.cc/100?u=socio2' },
  { id: 'user-arqjunior', name: 'Arq. Júnior (Carlos)', email: 'carlos.junior@arquitetura.com', role: 'Arquiteto Júnior', hourlyRate: 25.52, avatarUrl: 'https://i.pravatar.cc/100?u=arqjunior' },
  { id: 'user-estagiario1', name: 'Estagiário 01 (Diana)', email: 'diana.estagio@arquitetura.com', role: 'Estagiário de Arquitetura', hourlyRate: 9.33, avatarUrl: 'https://i.pravatar.cc/100?u=estagiario1' },
  { id: 'user-estagiario2', name: 'Estagiário 02 (Eduardo)', email: 'eduardo.estagio@arquitetura.com', role: 'Estagiário de Design', hourlyRate: 9.33, avatarUrl: 'https://i.pravatar.cc/100?u=estagiario2' },
  { id: 'por-elas', name: 'Por Elas (Terceirizado)', email: 'porelas@outsourcing.com', role: 'Serviços Terceirizados', hourlyRate: 35.00, avatarUrl: 'https://i.pravatar.cc/100?u=porelas'},
];


export const MOCK_CREDENTIALS = {
    email: 'clarissa@dev.com',
    password: 'password123'
};

export const MOCK_DEMO_CREDENTIALS = {
    email: 'demo@dev.com',
    password: 'demopass'
};

export const KANBAN_COLUMNS_DEFINITION: { id: TaskStatus; title: string }[] = [
  { id: TaskStatus.TO_DO, title: 'A Fazer' },
  { id: TaskStatus.IN_PROGRESS, title: 'Em Andamento' },
  { id: TaskStatus.COMPLETED, title: 'Concluído' },
  { id: TaskStatus.BLOCKED, title: 'Bloqueada' },
];

export const DEFAULT_PROJECT_IMAGE = 'https://picsum.photos/seed/project/400/300';

const sampleSubPhases: ProjectSubPhase[] = [
  { id: 'subphase-1-1', title: 'Definir paleta de cores', completed: true, order: 1, description: 'Escolha de 3 cores principais e 2 secundárias.' },
  { id: 'subphase-1-2', title: 'Selecionar texturas e materiais', completed: false, order: 2, description: 'Madeira, metal, tecidos.' },
  { id: 'subphase-1-3', title: 'Moodboard de referências', completed: false, order: 3 },
];

const samplePhases: ProjectPhase[] = [
  { id: 'phase-1', title: 'Levantamento de Necessidades', completed: true, order: 1, due_date: '2024-03-15', description: 'Reunião inicial e briefing com o cliente.' },
  { id: 'phase-2', title: 'Estudo Preliminar', completed: true, order: 2, due_date: '2024-04-01', description: 'Desenvolvimento dos primeiros esboços e conceitos.', subPhases: sampleSubPhases },
  { id: 'phase-3', title: 'Anteprojeto', completed: false, order: 3, due_date: '2024-05-01', description: 'Detalhamento do projeto com plantas baixas e elevações.' },
  { id: 'phase-4', title: 'Projeto Executivo', completed: false, order: 4, due_date: '2024-07-01', description: 'Especificações técnicas e detalhamentos finais.' },
  { id: 'phase-5', title: 'Acompanhamento de Obra', completed: false, order: 5, due_date: '2024-09-30', description: 'Visitas periódicas e gestão da execução.' },
];

const sampleFiles: ProjectFile[] = [
  { id: 'file-1', name: 'Briefing_Residencia_Alphaville.pdf', file_url: '/mock-files/briefing.pdf', uploaded_at: '2024-03-02', file_type: 'pdf', size: 1200000, uploaded_by: 'Clarissa Dario' },
  { id: 'file-2', name: 'Plantas_Estudo_Preliminar.dwg', file_url: '/mock-files/plantas_preliminares.dwg', uploaded_at: '2024-04-05', file_type: 'dwg', size: 5500000, uploaded_by: 'Clarissa Dario' },
  { id: 'file-3', name: 'Inspiracoes_Decoracao.zip', file_url: '/mock-files/inspiracoes.zip', uploaded_at: '2024-04-10', file_type: 'zip', size: 25000000, uploaded_by: 'Ana Silva' },
];

const sampleProjectTasks: Task[] = [
  { id: 'task-proj1-1', projectId: 'proj-1', title: 'Finalizar estudo preliminar (Projeto Alphaville)', status: TaskStatus.COMPLETED, due_date: '2024-04-01', responsible: 'Clarissa Dario', priority: 'Alta' },
  { id: 'task-proj1-2', projectId: 'proj-1', title: 'Apresentar anteprojeto ao cliente (Alphaville)', status: TaskStatus.TO_DO, due_date: '2024-05-05', responsible: 'Clarissa Dario', priority: 'Alta' },
  { id: 'task-proj1-3', projectId: 'proj-1', title: 'Orçar marcenaria (Alphaville)', status: TaskStatus.IN_PROGRESS, due_date: '2024-06-15', responsible: 'Equipe Clarissa', priority: 'Média' },
];

const samplePayments: Payment[] = [
  { id: 'pay-proj1-1', project_id: 'proj-1', description: 'Sinal - Etapa 1', value: 10000, due_date: '2024-03-01', status: PaymentStatus.PAID, payment_date: '2024-03-01', notes: 'Pago via PIX.', projectName: 'Residência Alphaville', clientName: 'Ana Silva' },
  { id: 'pay-proj1-2', project_id: 'proj-1', description: 'Parcela 2 - Anteprojeto', value: 15000, due_date: '2024-05-01', status: PaymentStatus.PAID, payment_date: '2024-05-03', projectName: 'Residência Alphaville', clientName: 'Ana Silva' },
  { id: 'pay-proj1-3', project_id: 'proj-1', description: 'Parcela 3 - Projeto Executivo', value: 15000, due_date: '2024-07-01', status: PaymentStatus.PENDING, projectName: 'Residência Alphaville', clientName: 'Ana Silva' },
  { id: 'pay-proj1-4', project_id: 'proj-1', description: 'Parcela Final - Acompanhamento', value: 10000, due_date: '2024-09-30', status: PaymentStatus.PENDING, projectName: 'Residência Alphaville', clientName: 'Ana Silva' },
  { id: 'pay-lc-1', project_id: 'proj-2', description: 'Entrada Loja Conceito', value: 10000, due_date: '2024-04-10', status: PaymentStatus.PAID, payment_date: '2024-04-10', projectName: 'Loja Conceito Centro', clientName: 'Loja Conceito Moda Urbana'},
  { id: 'pay-consult-1', project_id: 'proj-3', description: 'Pagamento Consultoria Jardins', value: 5000, due_date: '2024-05-01', status: PaymentStatus.PAID, payment_date: '2024-05-01', projectName: 'Consultoria Apartamento Jardins', clientName: 'Carlos Pereira (Consultoria)'},
  { id: 'pay-laudo-1', project_id: 'proj-4', description: 'Sinal Laudo Técnico', value: 1500, due_date: '2024-06-01', status: PaymentStatus.PAID, payment_date: '2024-06-01', projectName: 'Laudo Técnico Imóvel Comercial', clientName: 'Mariana Costa'},

];

const sampleContracts: Contract[] = [
  {
    id: 'contract-proj1-1', project_id: 'proj-1',
    title: 'Contrato Principal - Residência Alphaville',
    signed_at: '2024-02-28',
    file_url: '/mock-files/contrato_alphaville.pdf',
    value: 50000,
    payment_method: PaymentMethod.BANK_TRANSFER,
    notes: 'Contrato referente ao projeto de interiores completo.',
    addendums: [
        {id: 'addendum-1', description: 'Aditivo para inclusão de área gourmet', signed_at: '2024-06-15', file_url: '/mock-files/aditivo_gourmet.pdf', value_change: 5000}
    ]
  },
];

const sampleProjectAppointments: Appointment[] = [
  { id: 'appt-proj1-1', projectId: 'proj-1', title: 'Reunião de Briefing (Alphaville)', location: 'Escritório', date_time: '2024-08-01T10:00:00Z', attendees: ['Clarissa Dario', 'Ana Silva'], notes: 'Alinhamento inicial do projeto.', type: AppointmentType.PROJECT_MEETING },
  { id: 'appt-proj1-2', projectId: 'proj-1', title: 'Visita Técnica ao Local (Alphaville)', location: 'Residência Alphaville', date_time: '2024-08-05T14:00:00Z', attendees: ['Clarissa Dario'], notes: 'Medição e levantamento fotográfico.', type: AppointmentType.PROJECT_MEETING },
  { id: 'appt-proj1-3', projectId: 'proj-1', title: 'Apresentação do Anteprojeto (Alphaville)', location: 'Online', date_time: '2024-08-15T11:00:00Z', attendees: ['Clarissa Dario', 'Ana Silva'], type: AppointmentType.PROJECT_MEETING },
];

const sampleDetailedStages: ProjectStage[] = [
    {
        id: 'ds-1', name: 'ETAPA 01 - CONTATO E ORGANIZAÇÃO', isCollapsed: false, items: [
            { id: 'dsi-1-1', name: 'PRIMEIRO CONTATO - PRÉ-BRIEFING', responsibleId: 'por-elas', hours: 1 },
            { id: 'dsi-1-2', name: 'FICHA DE CADASTRO', responsibleId: 'user-clarissa', hours: 0.5 },
            { id: 'dsi-1-3', name: 'VISITA IN LOCO', responsibleId: 'user-clarissa', hours: 0.5 },
        ]
    },
    {
        id: 'ds-2', name: 'ETAPA 02 - ESTUDO PRELIMINAR', isCollapsed: true, items: [
             { id: 'dsi-2-1', name: 'ELABORAÇÃO E ESTUDO DO BRIEFING', responsibleId: 'por-elas', hours: 1.5 },
        ]
    }
];

export const MOCK_CLIENTS: Client[] = [
    {id: 'client-1', name: 'Ana Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', cpf_cnpj: '123.456.789-00', address: 'Alameda dos Ipês, 123, Alphaville, SP', createdAt: '2024-01-10', updatedAt: '2024-01-10'},
    {id: 'client-2', name: 'Loja Conceito Moda Urbana', email: 'contato@modaurbana.com', phone: '(11) 5555-1234', cpf_cnpj: '12.345.678/0001-99', address: 'Rua Augusta, 500, São Paulo, SP', createdAt: '2024-02-01', updatedAt: '2024-02-01'},
    {id: 'client-3', name: 'Carlos Pereira (Consultoria)', email: 'carlos.pereira@email.net', phone: '(21) 99999-8888', cpf_cnpj: '987.654.321-00', address: 'Av. Paulista, 1000, Apt 101, São Paulo, SP', createdAt: '2024-03-15', updatedAt: '2024-03-15'},
    {id: 'client-4', name: 'Mariana Costa', email: 'maricosta@me.com', phone: '(31) 98888-7777', cpf_cnpj: '111.222.333-44', address: 'Av. Faria Lima, 2500, São Paulo, SP', createdAt: '2024-04-05', updatedAt: '2024-04-05'},
    {id: 'client-5', name: 'Restaurante Sabor Local', email: 'gerencia@saborlocal.com.br', phone: '(11) 3333-4444', cpf_cnpj: '98.765.432/0001-00', address: 'Rua Clodomiro Amazonas, 789, Itaim Bibi, SP', createdAt: '2023-09-20', updatedAt: '2023-09-20'},
    {id: 'client-6', name: 'Fernando Oliveira', email: 'fernando.oliveira@company.com', phone: '(11) 97654-1234', cpf_cnpj: '22.333.444/0001-55', address: 'Rua das Palmeiras, 45, Morumbi, SP', createdAt: '2024-05-01', updatedAt: '2024-05-01'},
    {id: 'client-7', name: 'Beatriz Almeida', email: 'bia.almeida@personal.com', phone: '(11) 96543-2109', cpf_cnpj: '555.666.777-88', address: 'Av. Brigadeiro Luís Antônio, 2000, Apt 52, Bela Vista, SP', createdAt: '2024-06-11', updatedAt: '2024-06-11'},
];


export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    client_id: 'client-1',
    clientName: MOCK_CLIENTS.find(c => c.id === 'client-1')?.name,
    name: 'Residência Alphaville',
    type: ProjectType.RESIDENTIAL,
    address: 'Alameda dos Ipês, 123, Alphaville, SP',
    start_date: '2024-03-01',
    due_date: '2024-09-30',
    status: ProjectStatus.ONGOING,
    notes: 'Projeto de interiores completo para residência de alto padrão, incluindo design de mobiliário e acompanhamento de obra. Cliente busca um estilo moderno e aconchegante, com foco em materiais naturais e iluminação inteligente.',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-05-20T14:30:00Z',
    totalValue: 55000, 
    paidValue: 25000,
    phases: samplePhases,
    files: sampleFiles,
    tasks: sampleProjectTasks, 
    payments: samplePayments.filter(p => p.project_id === 'proj-1'),
    contracts: sampleContracts,
    appointments: sampleProjectAppointments,
    projectStyle: 'Padrão',
    detailedStages: sampleDetailedStages,
  },
  {
    id: 'proj-2',
    client_id: 'client-2',
    clientName: MOCK_CLIENTS.find(c => c.id === 'client-2')?.name,
    name: 'Loja Conceito Centro',
    type: ProjectType.COMMERCIAL,
    address: 'Rua Augusta, 500, São Paulo, SP',
    start_date: '2024-04-10',
    due_date: '2024-07-20',
    status: ProjectStatus.PLANNING,
    notes: 'Desenvolvimento de projeto arquitetônico para nova loja conceito. Foco em experiência do cliente e identidade visual da marca.',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-05-10T11:00:00Z',
    totalValue: 35000,
    paidValue: 10000,
    phases: [
      { id: 'phase-lc-1', title: 'Entendimento da Marca e Público', completed: true, order: 1, due_date: '2024-04-20' },
      { id: 'phase-lc-2', title: 'Layout e Zoneamento Funcional', completed: false, order: 2, due_date: '2024-05-15', subPhases: [{id: 'subphase-lc-2-1', title: 'Fluxograma de clientes', completed: false, order: 1} ] },
    ],
    files: [
      {id: 'file-lc-1', name: 'Manual_Marca_ModaUrbana.pdf', file_url: '/mock-files/manual_marca.pdf', uploaded_at: '2024-04-11', file_type:'pdf', size: 3000000}
    ],
    tasks: [ 
      { id: 'task-lc-1', projectId: 'proj-2', title: 'Pesquisa de referências para fachada (Loja Conceito)', status: TaskStatus.IN_PROGRESS, due_date: '2024-08-10', responsible: 'Clarissa Dario', priority: 'Alta' }
    ],
    payments: samplePayments.filter(p => p.project_id === 'proj-2'),
    appointments: [
        { id: 'appt-proj2-1', projectId: 'proj-2', title: 'Reunião Kick-off Loja Conceito', location: 'Escritório', date_time: '2024-07-25T14:00:00Z', type: AppointmentType.PROJECT_MEETING}
    ],
    projectStyle: 'Comercial Simplificado',
    detailedStages: [], // Empty for this one initially
  },
  {
    id: 'proj-3',
    client_id: 'client-3',
    clientName: MOCK_CLIENTS.find(c => c.id === 'client-3')?.name,
    name: 'Consultoria Apartamento Jardins',
    type: ProjectType.CONSULTANCY,
    address: 'Av. Paulista, 1000, Apt 101, São Paulo, SP',
    start_date: '2024-05-01',
    due_date: '2024-05-30',
    status: ProjectStatus.COMPLETED,
    notes: 'Consultoria de layout e decoração para apartamento.',
    createdAt: '2024-04-20T16:00:00Z',
    updatedAt: '2024-05-28T10:00:00Z',
    totalValue: 5000,
    paidValue: 5000,
    payments: samplePayments.filter(p => p.project_id === 'proj-3'),
  },
  {
    id: 'proj-4',
    client_id: 'client-4',
    clientName: MOCK_CLIENTS.find(c => c.id === 'client-4')?.name,
    name: 'Laudo Técnico Imóvel Comercial',
    type: ProjectType.REPORT,
    address: 'Av. Faria Lima, 2500, São Paulo, SP',
    start_date: '2024-06-01',
    due_date: '2024-06-15',
    status: ProjectStatus.ON_HOLD,
    notes: 'Laudo técnico para avaliação de imóvel comercial. Aguardando documentação.',
    createdAt: '2024-05-25T11:30:00Z',
    updatedAt: '2024-06-05T09:15:00Z',
    totalValue: 3000,
    paidValue: 1500,
    payments: samplePayments.filter(p => p.project_id === 'proj-4'),
  },
   {
    id: 'proj-overdue',
    client_id: 'client-6',
    clientName: MOCK_CLIENTS.find(c=>c.id === 'client-6')?.name,
    name: 'Projeto Escritório Faria Lima',
    type: ProjectType.COMMERCIAL,
    address: 'Av. Brigadeiro Faria Lima, 3000, São Paulo, SP',
    start_date: '2024-01-10',
    due_date: '2024-03-30', 
    status: ProjectStatus.ONGOING,
    notes: 'Projeto corporativo com prazo apertado, atualmente em atraso.',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-04-01T11:00:00Z',
    totalValue: 75000,
    paidValue: 30000,
    payments: [
        {id: 'pay-overdue-1', project_id: 'proj-overdue', description: 'Entrada Escritório', value: 30000, due_date: '2024-01-10', status: PaymentStatus.PAID, payment_date: '2024-01-10', projectName: 'Projeto Escritório Faria Lima', clientName: 'Fernando Oliveira'},
        {id: 'pay-overdue-2', project_id: 'proj-overdue', description: 'Parcela 2 Escritório', value: 25000, due_date: '2024-02-28', status: PaymentStatus.OVERDUE, projectName: 'Projeto Escritório Faria Lima', clientName: 'Fernando Oliveira'}
    ],
  },
];


export const MOCK_TASKS: Task[] = [
  { id: 'task-global-1', title: 'Revisar portfólio online', status: TaskStatus.TO_DO, due_date: '2024-08-10', responsible: 'Clarissa Dario', priority: 'Média', description: 'Atualizar com os últimos projetos concluídos.' },
  { id: 'task-global-2', title: 'Pesquisar novos fornecedores de iluminação', status: TaskStatus.IN_PROGRESS, due_date: '2024-08-20', responsible: 'Equipe Clarissa', priority: 'Média' },
  { id: 'task-global-3', title: 'Preparar apresentação para Workshop de Interiores', status: TaskStatus.TO_DO, due_date: '2024-09-01', responsible: 'Clarissa Dario', priority: 'Alta' },
  { id: 'task-global-4', title: 'Follow-up cliente potencial (Sr. Martins)', status: TaskStatus.COMPLETED, due_date: '2024-07-15', responsible: 'Clarissa Dario', priority: 'Alta', description: 'Ligação realizada, agendou visita.' },
  { id: 'task-global-5', title: 'Organizar drive de texturas e materiais', status: TaskStatus.BLOCKED, due_date: '2024-08-25', responsible: 'Estagiário', priority: 'Baixa', description: 'Aguardando acesso ao servidor.' },
  { id: 'task-proj1-link', projectId: 'proj-1', projectName: 'Residência Alphaville', title: 'Comprar revestimento banheiro suíte (Alphaville)', status: TaskStatus.TO_DO, due_date: '2024-08-05', responsible: 'Clarissa Dario', priority: 'Alta' },
  { id: 'task-proj2-link', projectId: 'proj-2', projectName: 'Loja Conceito Centro', title: 'Definir vitrine (Loja Conceito)', status: TaskStatus.IN_PROGRESS, due_date: '2024-08-12', responsible: 'Clarissa Dario', priority: 'Alta' },
];


export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1', client_id: 'client-1', clientName: MOCK_CLIENTS.find(c=>c.id === 'client-1')?.name,
    identifier: 'VISTALPH-001', inspection_type: InspectionType.PRE_PURCHASE_INSPECTION, status: InspectionStatus.SCHEDULED,
    address: 'Alameda das Acácias, 456, Alphaville, SP', scheduled_date: '2024-08-15T10:00:00Z', due_date: '2024-08-20', sla_limit: '5 dias',
    notes: 'Inspeção para Ana Silva, imóvel novo.', createdAt: '2024-07-20', updatedAt: '2024-07-21', bank: 'Particular', channel: 'Indicação'
  },
  {
    id: 'insp-2', client_id: 'client-4', clientName: MOCK_CLIENTS.find(c=>c.id === 'client-4')?.name,
    identifier: 'LAUDCOM-012', inspection_type: InspectionType.PROPERTY_VALUATION, status: InspectionStatus.COMPLETED,
    address: 'Av. Faria Lima, 2500, São Paulo, SP', scheduled_date: '2024-06-05T14:00:00Z', due_date: '2024-06-10',
    notes: 'Laudo para Mariana Costa, finalizado e entregue.', createdAt: '2024-06-01', updatedAt: '2024-06-10', bank: 'Itaú BBA', channel: 'Banco'
  },
  {
    id: 'insp-3', client_id: 'client-2', clientName: MOCK_CLIENTS.find(c=>c.id === 'client-2')?.name,
    identifier: 'ESTRLOJA-003', inspection_type: InspectionType.STRUCTURAL_INSPECTION, status: InspectionStatus.REPORT_PENDING,
    address: 'Rua Augusta, 500, São Paulo, SP', scheduled_date: '2024-07-25T09:00:00Z', due_date: '2024-08-05', sla_limit: '7 dias',
    notes: 'Inspeção estrutural para Loja Conceito. Aguardando laudo do engenheiro.', createdAt: '2024-07-15', updatedAt: '2024-07-26', bank: 'Santander', channel: 'Banco', cost_center: 'CC-00234'
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [ 
  { id: 'appt-gen-1', title: 'Almoço com Fornecedor X', location: 'Restaurante Figueira', date_time: '2024-08-02T12:30:00Z', notes: 'Discutir novas linhas de produtos.', type: AppointmentType.GENERAL, attendees: ['Clarissa Dario', 'Representante Fornecedor X'] },
  { id: 'appt-gen-2', title: 'Workshop de Tendências em Design', location: 'Online', date_time: '2024-08-08T09:00:00Z', end_date_time: '2024-08-08T17:00:00Z', type: AppointmentType.GENERAL, isAllDay: false },
  { id: 'appt-gen-3', title: 'Consulta Contabilidade', location: 'Escritório Contábil ABC', date_time: '2024-08-14T15:00:00Z', type: AppointmentType.GENERAL, attendees: ['Clarissa Dario'] },
  { id: 'appt-task-global-1', title: 'Prazo: Revisar portfólio online', date_time: '2024-08-10T23:59:59Z', type: AppointmentType.TASK_DEADLINE, relatedId: 'task-global-1', isAllDay: true },
  { id: 'appt-insp-1', title: 'Inspeção: VISTALPH-001 (Ana Silva)', date_time: MOCK_INSPECTIONS[0].scheduled_date, location: MOCK_INSPECTIONS[0].address, type: AppointmentType.INSPECTION_SCHEDULED, relatedId: 'insp-1' },
  { id: 'appt-payment-proj1-3', title: 'Vencimento: Parcela 3 - Projeto Executivo (Res. Alphaville)', date_time: samplePayments.find(p=>p.id === 'pay-proj1-3')?.due_date + 'T23:59:59Z' || '', type: AppointmentType.PAYMENT_DUE, relatedId: 'pay-proj1-3', projectId: 'proj-1', isAllDay: true },
];

export const ALL_MOCK_TASKS: Task[] = [
    ...MOCK_TASKS,
    ...MOCK_PROJECTS.flatMap(p => p.tasks || [])
];

export const ALL_MOCK_APPOINTMENTS: Appointment[] = [
    ...MOCK_APPOINTMENTS,
    ...MOCK_PROJECTS.flatMap(p => p.appointments || [])
];

export const ALL_MOCK_PAYMENTS: Payment[] = samplePayments.map(payment => {
  const project = MOCK_PROJECTS.find(p => p.id === payment.project_id);
  const client = project ? MOCK_CLIENTS.find(c => c.id === project.client_id) : undefined;
  return {
    ...payment,
    projectName: project?.name || 'N/A',
    clientName: client?.name || project?.clientName || 'N/A',
  };
});

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    potentialClientName: 'Mariana Lima',
    contactEmail: 'mari.lima@email.com',
    contactPhone: '(11) 91234-5678',
    projectDescription: 'Reforma completa de apartamento de 120m² no Itaim Bibi.',
    status: LeadStatus.NEW,
    source: LeadSource.REFERRAL,
    estimatedValue: 75000,
    nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    notes: 'Indicada por Ana Silva. Cliente quer um estilo contemporâneo e funcional.',
    responsibleUserId: MOCK_USER.id,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'lead-2',
    potentialClientName: 'Empresa XYZ Logística',
    contactEmail: 'contato@xyzlog.com',
    projectDescription: 'Projeto de interiores para novo escritório de 200m² na Faria Lima.',
    status: LeadStatus.PROPOSAL_SENT,
    source: LeadSource.WEBSITE,
    estimatedValue: 120000,
    nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    notes: 'Proposta enviada em PDF. Aguardando feedback.',
    responsibleUserId: MOCK_TEAM_MEMBERS.find(m => m.name.includes("Sócio 01"))?.id,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];


// Based on PDF p.30 "CUSTOS FIXOS"
export const DEFAULT_OFFICE_COST_CONFIGS_TEMPLATE: OfficeCostConfigItem[] = [
  { id: 'config-fixed-aluguel', name: 'Aluguel/Prestação Escritório', monthlyBaseValue: 1600 },
  { id: 'config-fixed-condominio', name: 'Condomínio Escritório', monthlyBaseValue: 400 },
  { id: 'config-fixed-seguro', name: 'Seguro Escritório', monthlyBaseValue: 100 },
  { id: 'config-fixed-iptu', name: 'IPTU Escritório', monthlyBaseValue: 100 },
  { id: 'config-fixed-luz', name: 'Luz', monthlyBaseValue: 120 },
  { id: 'config-fixed-internet', name: 'Internet', monthlyBaseValue: 100 },
  { id: 'config-fixed-agua', name: 'Água', monthlyBaseValue: 60 },
  { id: 'config-fixed-contador', name: 'Contador', monthlyBaseValue: 150 },
  { id: 'config-fixed-faxina', name: 'Faxina', monthlyBaseValue: 200 },
  { id: 'config-fixed-compras', name: 'Compras (café, material limpeza)', monthlyBaseValue: 300 },
  { id: 'config-fixed-assinaturas', name: 'Assinaturas (software, etc)', monthlyBaseValue: 80 },
  { id: 'config-fixed-software-lic', name: 'Softwares/Licenças (valor mensalizado)', monthlyBaseValue: 400 },
  { id: 'config-fixed-social-media', name: 'Social Media', monthlyBaseValue: 1000 },
  { id: 'config-fixed-gestor-trafego', name: 'Gestor de Tráfego', monthlyBaseValue: 1300 },
  { id: 'config-fixed-trafego-anuncios', name: 'Tráfego/Anúncios', monthlyBaseValue: 1000 },
  { id: 'config-fixed-gasolina-geral', name: 'Gasolina (geral escritório)', monthlyBaseValue: 400 },
];

// Based on PDF p.47 "CALCULO DO VALOR DA HORA DA EQUIPE" -> "VALOR DA HORA PESSOAL"
// and MOCK_TEAM_MEMBERS
export const DEFAULT_TEAM_MEMBER_CONFIGS_TEMPLATE: TeamMemberConfigItem[] = MOCK_TEAM_MEMBERS.map(member => ({
  id: member.id,
  name: member.name,
  role: member.role || 'Membro da Equipe',
  hourlyRate: member.hourlyRate || 0,
}));


// Based on PDF p.54 "TAXA DE COMPLEXIDADE DE PROJETO"
// Retaining original structure for ComplexityFactorItem in simulation
export const DEFAULT_COMPLEXITY_FACTORS_TEMPLATE: ComplexityFactorItem[] = [
  { id: 'complex-topo', name: 'Topografia', percentage: 0, isApplied: false },
  { id: 'complex-condo', name: 'Condomínio Difícil Aprovação', percentage: 0, isApplied: false },
  { id: 'complex-metodo', name: 'Método Construtivo Complexo', percentage: 0, isApplied: false },
  { id: 'complex-escada', name: 'Tipologia de Escada', percentage: 0, isApplied: false },
  { id: 'complex-programa', name: 'Programa de Necessidades Extenso', percentage: 0, isApplied: false },
  { id: 'complex-horario', name: 'Horário Não Comercial para Reunião', percentage: 0, isApplied: false },
  { id: 'complex-prazo', name: 'Prazo Curto', percentage: 0, isApplied: false },
  { id: 'complex-equipe-extra', name: 'Equipe Extra (Consultores)', percentage: 0, isApplied: false },
  { id: 'complex-sem-estudo-solo', name: 'Não tem Estudo de Solo', percentage: 0, isApplied: false },
  { id: 'complex-sem-estudo-topo', name: 'Não tem Estudo de Topografia', percentage: 0, isApplied: false },
  { id: 'complex-automacao', name: 'Automação', percentage: 0, isApplied: false },
  { id: 'complex-sustentabilidade', name: 'Sustentabilidade', percentage: 0, isApplied: false },
  { id: 'complex-imagens-realistas', name: 'Imagens Ultra Realistas Adicionais', percentage: 0, isApplied: false },
];

export const DEFAULT_PROJECT_DETAILED_STAGES_TEMPLATE: ProjectStage[] = [
  {
    id: 'template-stage-1', name: 'ETAPA 01 - CONTATO E ORGANIZAÇÃO', isCollapsed: false, items: [
      { id: 'template-item-1-1', name: 'PRIMEIRO CONTATO - PRÉ-BRIEFING', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-1-2', name: 'FICHA DE CADASTRO', responsibleId: 'user-clarissa', hours: 0.5 },
      { id: 'template-item-1-3', name: 'VISITA IN LOCO', responsibleId: 'user-clarissa', hours: 0.5 },
      { id: 'template-item-1-4', name: 'ELABORAÇÃO E APRESENTAÇÃO DA PROPOSTA DE PROJETO', responsibleId: 'por-elas', hours: 0.75 },
      { id: 'template-item-1-5', name: 'ORGANIZAÇÃO DE PASTAS E ARQUIVOS', responsibleId: 'user-clarissa', hours: 0.5 },
      { id: 'template-item-1-6', name: 'CONTRATO', responsibleId: 'user-clarissa', hours: 0.5 },
    ]
  },
  {
    id: 'template-stage-2', name: 'ETAPA 02 - ESTUDO PRELIMINAR', isCollapsed: true, items: [
      { id: 'template-item-2-1', name: 'ELABORAÇÃO E ESTUDO DO BRIEFING', responsibleId: 'por-elas', hours: 1.5 },
      { id: 'template-item-2-2', name: 'LEVANTAMENTO IN LOCO', responsibleId: 'user-clarissa', hours: 1 },
      { id: 'template-item-2-3', name: 'PASSAGEM DO LEVANTAMENTO A LIMPO', responsibleId: 'user-clarissa', hours: 2 },
      { id: 'template-item-2-4', name: 'PESQUISA DE REFERÊNCIAS', responsibleId: 'por-elas', hours: 0.5 },
      { id: 'template-item-2-5', name: 'PRIMEIROS ESTUDOS/CROQUIS', responsibleId: 'user-clarissa', hours: 1.5 },
      { id: 'template-item-2-6', name: 'ESTUDO DE LAYOUT E/OU IMPLANTAÇÃO', responsibleId: 'user-clarissa', hours: 1.5 },
      { id: 'template-item-2-7', name: 'MOOD BOARD', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-2-8', name: 'DESENVOLVIMENTO PLANTA LAYOUT', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-2-9', name: 'MONTAGEM DO ESTUDO PRELIMINAR E APRESENTAÇÃO', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-2-10', name: 'ATA DE APROVAÇÃO', responsibleId: 'user-clarissa', hours: 0.5 },
    ]
  },
  {
    id: 'template-stage-3', name: 'ETAPA 03 - ANTEPROJETO', isCollapsed: true, items: [
      { id: 'template-item-3-1', name: 'MODELAGEM 3D', responsibleId: 'por-elas', hours: 3 },
      { id: 'template-item-3-2', name: 'RENDERIZAÇÃO E PRODUÇÃO IMAGENS', responsibleId: 'user-clarissa', hours: 3 },
      { id: 'template-item-3-3', name: 'MONTAGEM E APRESENTAÇÃO DO ANTEPROJETO', responsibleId: 'user-clarissa', hours: 1 },
      { id: 'template-item-3-4', name: 'PERÍODO DE ALTERAÇÕES', responsibleId: 'por-elas', hours: 2 },
      { id: 'template-item-3-5', name: 'ATA DE APROVAÇÃO', responsibleId: 'user-clarissa', hours: 0.5 },
    ]
  },
  {
    id: 'template-stage-4', name: 'ETAPA 04 - PLANTAS GERAIS', isCollapsed: true, items: [
      { id: 'template-item-4-1', name: 'PLANTA DEMOLIR E CONSTRUIR', responsibleId: 'user-clarissa', hours: 1 },
      { id: 'template-item-4-2', name: 'PLANTA PAGINAÇÃO DE PISO', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-4-3', name: 'PLANTA PONTOS HIDRÁULICOS', responsibleId: 'user-clarissa', hours: 0.5 },
      { id: 'template-item-4-4', name: 'PLANTA PONTOS ELÉTRICOS', responsibleId: 'por-elas', hours: 1.5 },
      { id: 'template-item-4-5', name: 'PLANTA ILUMINAÇÃO', responsibleId: 'user-clarissa', hours: 1.5 },
      { id: 'template-item-4-6', name: 'PLANTA CIRCUITOS', responsibleId: 'por-elas', hours: 1.5 },
      { id: 'template-item-4-7', name: 'PLANTA FORRO E DETALHES', responsibleId: 'user-clarissa', hours: 1 },
      { id: 'template-item-4-8', name: 'REVISÃO DO DETALHAMENTO', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-4-9', name: 'GERAR ARQUIVOS PDF', responsibleId: 'user-clarissa', hours: 0 }, // Often 0 in PDF
    ]
  },
  {
    id: 'template-stage-5', name: 'ETAPA 05 - DETALHAMENTO ESPECÍFICO', isCollapsed: true, items: [
      { id: 'template-item-5-1', name: 'PLANTA LAYOUT E COTADA', responsibleId: 'user-clarissa', hours: 1 },
      { id: 'template-item-5-2', name: 'PLANTA DE ACABAMENTOS E MOBILIÁRIOS', responsibleId: 'por-elas', hours: 3 },
      { id: 'template-item-5-3', name: 'ELEVAÇÕES HUMANIZADAS E COTADAS', responsibleId: 'user-clarissa', hours: 3 },
      { id: 'template-item-5-4', name: 'PAGINAÇÃO DE PAREDES EM ELEVAÇÕES', responsibleId: 'por-elas', hours: 1.5 },
      { id: 'template-item-5-5', name: 'DETALHAMENTO DE MARCENARIA', responsibleId: 'por-elas', hours: 6 },
      { id: 'template-item-5-6', name: 'DETALHAMENTO DE MARMORARIA', responsibleId: 'user-clarissa', hours: 2 },
      { id: 'template-item-5-7', name: 'TABELAS DE QUANTITATIVO', responsibleId: 'por-elas', hours: 1 },
      { id: 'template-item-5-8', name: 'MONTAGEM FINAL DO DETALHAMENTO', responsibleId: 'user-clarissa', hours: 1.5 },
      { id: 'template-item-5-9', name: 'REVISÃO DO DETALHAMENTO', responsibleId: 'user-clarissa', hours: 1.5 },
      { id: 'template-item-5-10', name: 'GERAR ARQUIVOS PDF PARA IMPRESSÃO', responsibleId: 'por-elas', hours: 0.5 },
      { id: 'template-item-5-11', name: 'MONTAGEM DO KIT PROJETO', responsibleId: 'user-clarissa', hours: 0 }, // Often 0 in PDF
      { id: 'template-item-5-12', name: 'REUNIÃO DE ENTREGA FINAL', responsibleId: 'por-elas', hours: 1 },
    ]
  },
  {
    id: 'template-stage-6', name: 'ETAPA 06 - ACOMPANHAMENTO DE OBRA', isCollapsed: true, items: [
      { id: 'template-item-6-1', name: 'PLANILHA COM ORÇAMENTOS DE FORNECEDORES', responsibleId: 'user-clarissa', hours: 0 }, // Often Qtd in PDF
      { id: 'template-item-6-2', name: 'CRONOGRAMA DE OBRAS', responsibleId: 'user-clarissa', hours: 0 },
      { id: 'template-item-6-3', name: 'FECHAMENTO DE ORÇAMENTOS PARA EXECUÇÃO', responsibleId: 'user-clarissa', hours: 0 },
      { id: 'template-item-6-4', name: 'REUNIÃO COM CLIENTE / FORNECEDORES', responsibleId: 'user-clarissa', hours: 0 },
      { id: 'template-item-6-5', name: 'VISITA EM LOJAS/FORNECEDORES', responsibleId: 'user-clarissa', hours: 0 },
      { id: 'template-item-6-6', name: 'VISITA EM OBRAS', responsibleId: 'user-clarissa', hours: 0 },
      { id: 'template-item-6-7', name: 'CUSTO DE DESLOCAMENTO', responsibleId: 'user-clarissa', hours: 0 },
    ]
  }
];

// Ensure IDs in templates are unique if multiple templates or dynamic loading is ever used.
// For a single static template, these are fine.
// The responsibleId values here assume they match IDs in MOCK_TEAM_MEMBERS.
// Hours for ETAPA 06 are often 'Qtd.' in the PDF, which means quantity-based rather than hours for some.
// For simplicity here, they are hours. This might need adjustment based on how 'Qtd.' should be interpreted.
// For items with 0 hours in the PDF, I've kept them as 0. The user can adjust these.