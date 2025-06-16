
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS } from '../constants';
import { Project, ProjectStatus, ProjectType, Client } from '../types';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { PlusCircle, Filter, Search, ListFilter, Briefcase as BriefcaseIcon } from 'lucide-react';
import * as dbService from '../services/databaseService';

type SortOption = 'due_date_asc' | 'due_date_desc' | 'name_asc' | 'name_desc' | 'start_date_asc' | 'start_date_desc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'due_date_asc', label: 'Data de Entrega (Mais Próxima)' },
  { value: 'due_date_desc', label: 'Data de Entrega (Mais Distante)' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
  { value: 'start_date_asc', label: 'Data de Início (Mais Recente)' },
  { value: 'start_date_desc', label: 'Data de Início (Mais Antiga)' },
];

interface ProjectsPageProps {
  navigateTo: (path: string) => void;
  projects: Project[]; // From App state (DB sourced)
  setProjectsState: React.Dispatch<React.SetStateAction<Project[]>>; // To update App's local copy
  clients: Client[]; // From App state (DB sourced)
  setClientsState: React.Dispatch<React.SetStateAction<Client[]>>; // To update App's local copy
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ navigateTo, projects, setProjectsState, clients, setClientsState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ProjectType | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('due_date_asc');
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(projectToEdit?.client_id || '');

  const fetchProjects = async () => {
    setProjectsState(await dbService.getProjects());
  };
  const fetchClients = async () => {
    setClientsState(await dbService.getClients());
  };


  const statusFilterOptions = [{ value: '', label: 'Todos os Status' }, ...PROJECT_STATUS_OPTIONS.map(s => ({ value: s, label: s }))];
  const typeFilterOptions = [{ value: '', label: 'Todos os Tipos' }, ...PROJECT_TYPE_OPTIONS.map(t => ({ value: t, label: t }))];
  
  const clientOptions = useMemo(() => [
    { value: '', label: 'Selecione um cliente' },
    ...clients.map(c => ({ value: c.id, label: c.name })),
    { value: 'add_new_client', label: '-- Adicionar Novo Cliente --' }
  ], [clients]);

  useEffect(() => {
    if (projectToEdit) {
      setSelectedClientId(projectToEdit.client_id);
    } else {
      setSelectedClientId('');
    }
  }, [projectToEdit]);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName && p.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (clients.find(c => c.id === p.client_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'due_date_asc':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'due_date_desc':
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'start_date_asc':
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime(); 
        case 'start_date_desc':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime(); 
        default:
          return 0;
      }
    });
  }, [projects, searchTerm, statusFilter, typeFilter, sortBy, clients]);

  const handleAddNewProject = () => {
    setProjectToEdit(null); 
    setSelectedClientId('');
    setIsProjectModalOpen(true);
  };
  
  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setProjectToEdit(project);
        setSelectedClientId(project.client_id);
        setIsProjectModalOpen(true);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) {
        await dbService.deleteProject(projectId);
        fetchProjects();
    }
  };

  const handleViewDetails = (projectId: string) => {
    navigateTo(`/projects/${projectId}`);
  };
  
  const handleSaveProject = async (formData: FormData) => {
    const client_id = formData.get('client_id') as string;
    const client = clients.find(c => c.id === client_id);

    const projectData: Partial<Project> = {
        client_id,
        clientName: client?.name || '', 
        name: formData.get('name') as string,
        type: formData.get('type') as ProjectType,
        address: formData.get('address') as string,
        start_date: formData.get('start_date') as string,
        due_date: formData.get('due_date') as string,
        status: formData.get('status') as ProjectStatus,
        notes: formData.get('notes') as string,
        totalValue: formData.get('totalValue') ? parseFloat(formData.get('totalValue') as string) : undefined,
        paidValue: formData.get('paidValue') ? parseFloat(formData.get('paidValue') as string) : undefined,
        projectStyle: projectToEdit?.projectStyle || undefined, // Keep existing if editing
        detailedStages: projectToEdit?.detailedStages || [], // Keep existing if editing
        phases: projectToEdit?.phases || [],
        files: projectToEdit?.files || [],
        tasks: projectToEdit?.tasks || [],
        payments: projectToEdit?.payments || [],
        contracts: projectToEdit?.contracts || [],
        appointments: projectToEdit?.appointments || [],
        updatedAt: new Date().toISOString(),
    };
    
    if (projectToEdit) {
        const updatedProject = { ...projectToEdit, ...projectData };
        await dbService.updateProject(updatedProject);
    } else {
        const newProject: Project = { 
            ...projectData, 
            id: `proj-${Date.now()}`, 
            createdAt: new Date().toISOString(),
        } as Project; // Casting because some optional fields in Project might not be in projectData
        await dbService.addProject(newProject);
    }
    fetchProjects();
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
  };

  const handleSaveNewClient = async (clientData: Client) => {
    const existingClient = clients.find(c => c.id === clientData.id);
    if (existingClient) {
        await dbService.updateClient(clientData);
    } else {
        await dbService.addClient(clientData);
    }
    fetchClients(); 
    setSelectedClientId(clientData.id); 
    setIsClientModalOpen(false); 
  };
  
  const handleClientSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'add_new_client') {
      setIsClientModalOpen(true);
    } else {
      setSelectedClientId(value);
    }
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) { return ''; }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-clarissa-dark">Projetos</h1>
        <Button onClick={handleAddNewProject} leftIcon={<PlusCircle size={20} />} variant="primary">
          Novo Projeto
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            label="Buscar Projeto"
            placeholder="Nome, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />
          <Select
            label="Status"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
            icon={<ListFilter size={18} />}
          />
          <Select
            label="Tipo"
            options={typeFilterOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ProjectType | '')}
            icon={<BriefcaseIcon size={18}/>}
          />
          <Select
            label="Ordenar Por"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          />
        </div>
      </div>

      {filteredAndSortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onViewDetails={handleViewDetails}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Filter size={48} className="mx-auto text-clarissa-secondary mb-4" />
          <p className="text-xl text-clarissa-dark font-semibold">Nenhum projeto encontrado</p>
          <p className="text-clarissa-secondary">Tente ajustar seus filtros ou cadastre um novo projeto.</p>
        </div>
      )}

      <Modal isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setProjectToEdit(null); }} title={projectToEdit ? "Editar Projeto" : "Adicionar Novo Projeto"} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveProject(new FormData(e.target as HTMLFormElement)); }} className="space-y-4">
            <Input name="name" label="Nome do Projeto" defaultValue={projectToEdit?.name} required />
            
            <Select 
              name="client_id" 
              label="Cliente" 
              options={clientOptions} 
              value={selectedClientId}
              onChange={handleClientSelectionChange}
              required 
            />

            <Select name="type" label="Tipo de Projeto" options={PROJECT_TYPE_OPTIONS.map(opt => ({value: opt, label: opt}))} defaultValue={projectToEdit?.type} required />
            <Input name="address" label="Endereço" defaultValue={projectToEdit?.address} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="start_date" label="Data de Início" type="date" defaultValue={formatDateForInput(projectToEdit?.start_date)} required />
                <Input name="due_date" label="Data de Entrega" type="date" defaultValue={formatDateForInput(projectToEdit?.due_date)} required />
            </div>
            <Select name="status" label="Status" options={PROJECT_STATUS_OPTIONS.map(opt => ({value: opt, label: opt}))} defaultValue={projectToEdit?.status} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="totalValue" label="Valor Total (R$)" type="number" step="0.01" defaultValue={projectToEdit?.totalValue?.toString()} />
                <Input name="paidValue" label="Valor Pago (R$)" type="number" step="0.01" defaultValue={projectToEdit?.paidValue?.toString()} />
            </div>
            <Textarea name="notes" label="Observações" defaultValue={projectToEdit?.notes} />
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => { setIsProjectModalOpen(false); setProjectToEdit(null); }}>Cancelar</Button>
                <Button type="submit" variant="primary">{projectToEdit ? "Salvar Alterações" : "Criar Projeto"}</Button>
            </div>
        </form>
      </Modal>

      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveNewClient}
      />

    </div>
  );
};
