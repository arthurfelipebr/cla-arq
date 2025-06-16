
import React, { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStatus, LeadSource, Client, Project, User as TeamUser, ProjectStatus, ProjectType } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { LeadCard } from '../components/crm/LeadCard';
import { LeadFormModal } from '../components/crm/LeadFormModal';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { PlusCircle, Filter as FilterIcon, Search, ListFilter, Lightbulb } from 'lucide-react';
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS, PROJECT_STYLE_OPTIONS, DEFAULT_PROJECT_DETAILED_STAGES_TEMPLATE } from '../constants';
import * as dbService from '../services/databaseService';

interface CrmPageProps {
  leads: Lead[];
  setLeadsState: React.Dispatch<React.SetStateAction<Lead[]>>;
  clients: Client[];
  setClientsState: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjectsState: React.Dispatch<React.SetStateAction<Project[]>>;
  teamMembers: TeamUser[]; 
  navigateTo: (path: string) => void;
}

type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'nextActionDate_asc' | 'estimatedValue_desc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'createdAt_desc', label: 'Mais Recentes Primeiro' },
  { value: 'createdAt_asc', label: 'Mais Antigos Primeiro' },
  { value: 'nextActionDate_asc', label: 'Próxima Ação (Mais Cedo)' },
  { value: 'estimatedValue_desc', label: 'Valor Estimado (Maior)' },
];


export const CrmPage: React.FC<CrmPageProps> = ({ 
    leads, setLeadsState, 
    clients, setClientsState,
    projects, setProjectsState,
    teamMembers,
    navigateTo 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt_desc');

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  const fetchLeads = async () => setLeadsState(await dbService.getLeads());
  const fetchClients = async () => setClientsState(await dbService.getClients());
  const fetchProjects = async () => setProjectsState(await dbService.getProjects());


  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => lead.status !== LeadStatus.ARCHIVED && lead.status !== LeadStatus.WON); 

    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.potentialClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.contactEmail && l.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    if (sourceFilter) {
      filtered = filtered.filter(l => l.source === sourceFilter);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'createdAt_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'nextActionDate_asc':
          if (!a.nextActionDate) return 1;
          if (!b.nextActionDate) return -1;
          return new Date(a.nextActionDate).getTime() - new Date(b.nextActionDate).getTime();
        case 'estimatedValue_desc':
          return (b.estimatedValue || 0) - (a.estimatedValue || 0);
        default:
          return 0;
      }
    });
  }, [leads, searchTerm, statusFilter, sourceFilter, sortBy]);

  const handleOpenLeadModal = (lead?: Lead) => {
    setLeadToEdit(lead || null);
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = async (leadData: Lead) => {
    if (leadToEdit) {
        await dbService.updateLead(leadData);
    } else {
        await dbService.addLead(leadData);
    }
    fetchLeads();
    setIsLeadModalOpen(false);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta oportunidade? A simulação de custos associada também será removida.")) {
      await dbService.deleteLead(leadId); // This also handles deleting associated cost simulation in dbService
      fetchLeads();
    }
  };
  
  const handleClientModalSaveForConversion = async (clientData: Client) => {
      const existingClient = clients.find(c => c.id === clientData.id);
      if (existingClient) {
          await dbService.updateClient(clientData);
      } else {
          await dbService.addClient(clientData);
      }
      fetchClients();
      setIsClientModalOpen(false); 
      if (leadToConvert) { 
          convertLeadToProject(leadToConvert, clientData); // Use the saved/updated clientData
      }
  };

  const startLeadToProjectConversion = (lead: Lead) => {
      setLeadToConvert(lead); 
      const existingClient = clients.find(c => 
          c.name.toLowerCase() === lead.potentialClientName.toLowerCase() ||
          (lead.contactEmail && c.email && c.email.toLowerCase() === lead.contactEmail.toLowerCase())
      );

      if (existingClient) {
          if(window.confirm(`Cliente "${existingClient.name}" encontrado. Deseja usar este cliente para o novo projeto ou criar um novo? Clique 'OK' para usar o existente ou 'Cancelar' para criar um novo.`)) {
              convertLeadToProject(lead, existingClient);
          } else {
              setIsClientModalOpen(true); 
          }
      } else {
          setIsClientModalOpen(true); 
      }
  };
  
  const convertLeadToProject = async (lead: Lead, client: Client) => {
      if (!lead || !client) return;
      
      const newProject: Project = {
          id: `proj-${Date.now()}`,
          client_id: client.id,
          clientName: client.name,
          name: lead.projectDescription.substring(0, 50) || `Projeto ${client.name}`, 
          type: ProjectType.RESIDENTIAL, 
          address: client.address || 'A definir',
          start_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          status: ProjectStatus.PLANNING,
          notes: `Convertido da Oportunidade CRM: ${lead.potentialClientName} - ${lead.projectDescription}\n\nObservações da Oportunidade:\n${lead.notes || ''}`,
          totalValue: lead.estimatedValue || 0, 
          paidValue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phases: [], files: [], tasks: [], payments: [], contracts: [], appointments: [],
          projectStyle: PROJECT_STYLE_OPTIONS[0], 
          detailedStages: JSON.parse(JSON.stringify(DEFAULT_PROJECT_DETAILED_STAGES_TEMPLATE)) 
      };
      await dbService.addProject(newProject);
      await dbService.updateLead({...lead, status: LeadStatus.WON});
      fetchProjects();
      fetchLeads();
      alert(`Oportunidade convertida para projeto "${newProject.name}"!`);
      setLeadToConvert(null); 
      navigateTo(`/projects/${newProject.id}`);
  };


  const statusFilterOptions = [{ value: '', label: 'Todos os Status (Ativos)' }, ...LEAD_STATUS_OPTIONS.filter(s => s !== LeadStatus.ARCHIVED && s !== LeadStatus.WON).map(s => ({ value: s, label: s }))];
  const sourceFilterOptions = [{ value: '', label: 'Todas as Fontes' }, ...LEAD_SOURCE_OPTIONS.map(s => ({ value: s, label: s }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-clarissa-dark flex items-center"><Lightbulb size={30} className="mr-3 text-clarissa-primary"/>Oportunidades (CRM)</h1>
        <Button onClick={() => handleOpenLeadModal()} leftIcon={<PlusCircle size={20} />} variant="primary">
          Nova Oportunidade
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            label="Buscar Oportunidade"
            placeholder="Cliente, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />
          <Select
            label="Status"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
            icon={<ListFilter size={18} />}
          />
          <Select
            label="Fonte"
            options={sourceFilterOptions}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
            icon={<FilterIcon size={18} />}
          />
          <Select
            label="Ordenar Por"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          />
        </div>
      </div>

      {filteredAndSortedLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedLeads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onEdit={() => handleOpenLeadModal(lead)} 
              onDelete={() => handleDeleteLead(lead.id)}
              onViewDetails={() => navigateTo(`/crm/${lead.id}`)} 
              onConvertToProject={() => startLeadToProjectConversion(lead)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-xl shadow-subtle">
          <Lightbulb size={48} className="mx-auto text-clarissa-secondary mb-4" />
          <p className="text-xl text-clarissa-dark font-semibold">Nenhuma oportunidade encontrada</p>
          <p className="text-clarissa-secondary">Tente ajustar seus filtros ou cadastre uma nova oportunidade.</p>
        </div>
      )}

      {isLeadModalOpen && (
        <LeadFormModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          onSave={handleSaveLead}
          leadToEdit={leadToEdit}
          teamMembers={teamMembers} 
        />
      )}
      
      {isClientModalOpen && leadToConvert && ( 
          <ClientFormModal
            isOpen={isClientModalOpen}
            onClose={() => {
                setIsClientModalOpen(false);
            }}
            onSave={handleClientModalSaveForConversion} 
            clientToEdit={{ 
                id: `client-${Date.now()}`, // Temporary ID for new client
                name: leadToConvert.potentialClientName, 
                email: leadToConvert.contactEmail || '', 
                phone: leadToConvert.contactPhone || '',
                cpf_cnpj: '', 
                address: '', 
                notes: `Cliente criado a partir da oportunidade: ${leadToConvert.projectDescription}`,
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString()
            } as Client} 
          />
      )}
    </div>
  );
};
