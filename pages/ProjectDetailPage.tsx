

import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStatus, ProjectPhase as ProjectPhaseType, ProjectSubPhase as ProjectSubPhaseType, ProjectFile as ProjectFileType, Task as TaskType, Payment as PaymentType, Contract as ContractType, Appointment as AppointmentType, PaymentStatus, Client, PaymentMethod, Task, Appointment, ProjectStage, User as TeamUser } from '../types';
import { MOCK_CLIENTS, STATUS_COLORS, PAYMENT_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, PROJECT_STYLE_OPTIONS } from '../constants'; 
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Tabs } from '../components/common/Tabs';
import { DetailedStagesPricingForm } from '../components/projects/DetailedStagesPricingForm'; 
import { ArrowLeft, Edit3, PlusCircle, CheckCircle, Circle, FileText as FileTextIcon, ListChecks, DollarSign, Briefcase, CalendarDays, Info, Clock, AlertTriangle, Paperclip, Download, Users, MapPin, ExternalLink, Trash2, ChevronDown, ChevronUp, BarChart3, Copy } from 'lucide-react';
import * as dbService from '../services/databaseService';


const formatDate = (dateString?: string, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString); 
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/) && !includeTime) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
  }
  return date.toLocaleDateString('pt-BR', options);
};

const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) { return ''; }
};

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) {
        return 'R$ 0,00';
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


// --- Item Components ---
const SubPhaseItem: React.FC<{
  subPhase: ProjectSubPhaseType;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ subPhase, onToggleComplete, onEdit, onDelete }) => (
  <div className="ml-8 mt-2 p-3 bg-clarissa-background/50 rounded-md border border-clarissa-lightgray">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={onToggleComplete} className="mr-2 focus:outline-none" aria-label={`Marcar sub-fase ${subPhase.title} como ${subPhase.completed ? 'não concluída' : 'concluída'}`}>
          {subPhase.completed ? <CheckCircle size={18} className="text-clarissa-success" /> : <Circle size={18} className="text-clarissa-secondary" />}
        </button>
        <span className={`text-sm ${subPhase.completed ? 'line-through text-clarissa-secondary' : 'text-clarissa-dark'}`}>{subPhase.title}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={onEdit} className="p-1" aria-label="Editar sub-fase"><Edit3 size={14} /></Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="p-1 text-clarissa-danger" aria-label="Excluir sub-fase"><Trash2 size={14} /></Button>
      </div>
    </div>
    {subPhase.description && <p className="text-xs text-clarissa-text mt-1 ml-6">{subPhase.description}</p>}
  </div>
);

const PhaseItem: React.FC<{
  phase: ProjectPhaseType;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubPhase: () => void;
  onToggleSubPhaseComplete: (subPhaseId: string) => void;
  onEditSubPhase: (subPhase: ProjectSubPhaseType) => void;
  onDeleteSubPhase: (subPhaseId: string) => void;
}> = ({ phase, onToggleComplete, onEdit, onDelete, onAddSubPhase, onToggleSubPhaseComplete, onEditSubPhase, onDeleteSubPhase }) => {
  const [subPhasesVisible, setSubPhasesVisible] = useState(true);
  return (
    <Card className="mb-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
           <button onClick={onToggleComplete} className="mr-2 focus:outline-none" aria-label={`Marcar fase ${phase.title} como ${phase.completed ? 'não concluída' : 'concluída'}`}>
            {phase.completed ? <CheckCircle size={20} className="text-clarissa-success" /> : <Circle size={20} className="text-clarissa-secondary" />}
          </button>
          <h4 className={`font-semibold ${phase.completed ? 'line-through text-clarissa-secondary' : 'text-clarissa-dark'}`}>{phase.title}</h4>
        </div>
        <div className="flex items-center space-x-1">
          {phase.due_date && <span className="text-sm text-clarissa-secondary mr-2">Prazo: {formatDate(phase.due_date)}</span>}
          <Button variant="ghost" size="sm" onClick={onAddSubPhase} className="p-1" aria-label="Adicionar sub-fase"><PlusCircle size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={onEdit} className="p-1" aria-label="Editar fase"><Edit3 size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="p-1 text-clarissa-danger" aria-label="Excluir fase"><Trash2 size={16} /></Button>
          {phase.subPhases && phase.subPhases.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSubPhasesVisible(!subPhasesVisible)} className="p-1" aria-label={subPhasesVisible ? "Esconder sub-fases" : "Mostrar sub-fases"}>
              {subPhasesVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          )}
        </div>
      </div>
      {phase.description && <p className="text-sm text-clarissa-text mt-1 ml-8">{phase.description}</p>}
      {subPhasesVisible && phase.subPhases && phase.subPhases.length > 0 && (
        <div className="mt-2">
          {phase.subPhases.sort((a,b) => a.order - b.order).map(sp => (
            <SubPhaseItem 
              key={sp.id} 
              subPhase={sp} 
              onToggleComplete={() => onToggleSubPhaseComplete(sp.id)}
              onEdit={() => onEditSubPhase(sp)}
              onDelete={() => onDeleteSubPhase(sp.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};


const FileItem: React.FC<{ file: ProjectFileType }> = ({ file }) => (
  <Card className="mb-3 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center overflow-hidden">
        <Paperclip size={20} className="text-clarissa-primary mr-3 flex-shrink-0" />
        <div className="overflow-hidden">
            <p className="font-semibold text-clarissa-dark truncate" title={file.name}>{file.name}</p>
            <p className="text-xs text-clarissa-secondary">
                {formatDate(file.uploaded_at)} {file.file_type && `(${file.file_type.toUpperCase()})`} {file.size && `- ${(file.size / 1024 / 1024).toFixed(2)}MB`}
            </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => window.open(file.file_url, '_blank')} leftIcon={<Download size={16} />}>
        Baixar
      </Button>
    </div>
  </Card>
);

const TaskItem: React.FC<{ task: TaskType }> = ({ task }) => (
  <Card className="mb-3 p-4">
    <div className="flex items-center justify-between">
        <h4 className="font-semibold text-clarissa-dark">{task.title}</h4>
        <Badge text={task.status} />
    </div>
    {task.description && <p className="text-sm text-clarissa-text mt-1">{task.description}</p>}
    <div className="flex justify-between items-center mt-2 text-xs text-clarissa-secondary">
        <span>{task.responsible && `Responsável: ${task.responsible}`}</span>
        <span>{task.due_date && `Prazo: ${formatDate(task.due_date)}`}</span>
    </div>
  </Card>
);

const PaymentItem: React.FC<{ payment: PaymentType; onEdit: () => void; onDelete: () => void; }> = ({ payment, onEdit, onDelete }) => (
  <Card className="mb-3 p-4">
    <div className="flex items-center justify-between">
        <div>
            <h4 className="font-semibold text-clarissa-dark">{payment.description}</h4>
            <p className="text-sm text-clarissa-primary font-medium">R$ {payment.value.toFixed(2)}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Badge text={payment.status} />
          <Button variant="ghost" size="sm" onClick={onEdit} className="p-1"><Edit3 size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="p-1 text-clarissa-danger"><Trash2 size={16} /></Button>
        </div>
    </div>
    <div className="flex justify-between items-center mt-2 text-xs text-clarissa-secondary">
        <span>Vencimento: {formatDate(payment.due_date)}</span>
        {payment.status === PaymentStatus.PAID && payment.payment_date && <span>Pago em: {formatDate(payment.payment_date)}</span>}
    </div>
    {payment.notes && <p className="text-xs text-clarissa-text mt-1 italic">{payment.notes}</p>}
  </Card>
);

// PaymentFormModal
interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentType) => void;
  paymentToEdit?: PaymentType | null;
  projectId: string;
}
const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, onSave, paymentToEdit, projectId }) => {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (paymentToEdit) {
      setDescription(paymentToEdit.description);
      setValue(paymentToEdit.value);
      setDueDate(formatDateForInput(paymentToEdit.due_date));
      setStatus(paymentToEdit.status);
      setPaymentDate(paymentToEdit.payment_date ? formatDateForInput(paymentToEdit.payment_date) : '');
      setNotes(paymentToEdit.notes || '');
    } else {
      setDescription(''); setValue(''); setDueDate(''); setStatus(PaymentStatus.PENDING); setPaymentDate(''); setNotes('');
    }
  }, [paymentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === '') return; 
    const paymentData: PaymentType = {
      id: paymentToEdit?.id || `pay-${Date.now()}`,
      project_id: projectId,
      description,
      value: Number(value),
      due_date: dueDate,
      status,
      payment_date: status === PaymentStatus.PAID ? paymentDate : undefined,
      notes,
    };
    onSave(paymentData);
    onClose();
  };
  
  const paymentStatusOptions = PAYMENT_STATUS_OPTIONS.map(s => ({ value: s, label: s }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={paymentToEdit ? "Editar Pagamento" : "Adicionar Pagamento"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Descrição" value={description} onChange={e => setDescription(e.target.value)} required />
        <Input label="Valor (R$)" type="number" step="0.01" value={value === '' ? '' : String(value)} onChange={e => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))} required />
        <Input label="Data de Vencimento" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        <Select label="Status" options={paymentStatusOptions} value={status} onChange={e => setStatus(e.target.value as PaymentStatus)} required />
        {status === PaymentStatus.PAID && (
          <Input label="Data de Pagamento" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
        )}
        <Textarea label="Observações" value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{paymentToEdit ? "Salvar" : "Adicionar"}</Button>
        </div>
      </form>
    </Modal>
  );
};

// PhaseFormModal
interface PhaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: ProjectPhaseType) => void;
  phaseToEdit?: ProjectPhaseType | null;
}
const PhaseFormModal: React.FC<PhaseFormModalProps> = ({ isOpen, onClose, onSave, phaseToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (phaseToEdit) {
      setTitle(phaseToEdit.title);
      setDescription(phaseToEdit.description || '');
      setDueDate(phaseToEdit.due_date ? formatDateForInput(phaseToEdit.due_date) : '');
    } else {
      setTitle(''); setDescription(''); setDueDate('');
    }
  }, [phaseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phaseData: ProjectPhaseType = {
      id: phaseToEdit?.id || `phase-${Date.now()}`,
      title,
      description,
      due_date: dueDate || undefined,
      completed: phaseToEdit?.completed || false,
      order: phaseToEdit?.order || 0, 
      subPhases: phaseToEdit?.subPhases || [],
    };
    onSave(phaseData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={phaseToEdit ? "Editar Fase" : "Adicionar Fase"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título da Fase" value={title} onChange={e => setTitle(e.target.value)} required />
        <Textarea label="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
        <Input label="Data de Prazo" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{phaseToEdit ? "Salvar" : "Adicionar"}</Button>
        </div>
      </form>
    </Modal>
  );
};

// SubPhaseFormModal
interface SubPhaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subPhase: ProjectSubPhaseType) => void;
  subPhaseToEdit?: ProjectSubPhaseType | null;
}
const SubPhaseFormModal: React.FC<SubPhaseFormModalProps> = ({ isOpen, onClose, onSave, subPhaseToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (subPhaseToEdit) {
      setTitle(subPhaseToEdit.title);
      setDescription(subPhaseToEdit.description || '');
    } else {
      setTitle(''); setDescription('');
    }
  }, [subPhaseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subPhaseData: ProjectSubPhaseType = {
      id: subPhaseToEdit?.id || `subphase-${Date.now()}`,
      title,
      description,
      completed: subPhaseToEdit?.completed || false,
      order: subPhaseToEdit?.order || 0, 
    };
    onSave(subPhaseData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={subPhaseToEdit ? "Editar Sub-Fase" : "Adicionar Sub-Fase"} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título da Sub-Fase" value={title} onChange={e => setTitle(e.target.value)} required />
        <Textarea label="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{subPhaseToEdit ? "Salvar" : "Adicionar"}</Button>
        </div>
      </form>
    </Modal>
  );
};


const ContractItem: React.FC<{ contract: ContractType }> = ({ contract }) => (
  <Card className="mb-3 p-4">
    <div className="flex items-center justify-between">
        <h4 className="font-semibold text-clarissa-dark">{contract.title}</h4>
        <Button variant="outline" size="sm" onClick={() => window.open(contract.file_url, '_blank')} leftIcon={<ExternalLink size={16}/>}>
            Ver Contrato
        </Button>
    </div>
    <p className="text-sm text-clarissa-secondary">Assinado em: {formatDate(contract.signed_at)}</p>
    <p className="text-sm text-clarissa-text">Valor: R$ {contract.value.toFixed(2)} ({contract.payment_method})</p>
    {contract.notes && <p className="text-xs text-clarissa-text mt-1 italic">{contract.notes}</p>}
    {contract.addendums && contract.addendums.length > 0 && (
        <div className="mt-3 pt-3 border-t border-clarissa-lightgray">
            <h5 className="text-sm font-semibold text-clarissa-dark mb-1">Aditivos:</h5>
            {contract.addendums.map(addendum => (
                <div key={addendum.id} className="text-xs text-clarissa-text mb-1 pl-2">
                    <p>{addendum.description} (Assinado: {formatDate(addendum.signed_at)})
                        <Button variant="link" size="sm" onClick={() => window.open(addendum.file_url, '_blank')} className="ml-1 p-0 h-auto text-xs">Ver Aditivo</Button>
                    </p>
                    {addendum.value_change && <p>Alteração de valor: R$ {addendum.value_change.toFixed(2)}</p>}
                </div>
            ))}
        </div>
    )}
  </Card>
);

const AppointmentItem: React.FC<{ appointment: AppointmentType }> = ({ appointment }) => (
  <Card className="mb-3 p-4">
    <h4 className="font-semibold text-clarissa-dark">{appointment.title}</h4>
    <div className="text-sm text-clarissa-text">
        <p className="flex items-center"><CalendarDays size={14} className="mr-2 text-clarissa-secondary"/> {formatDate(appointment.date_time, true)}</p>
        {appointment.location && <p className="flex items-center"><MapPin size={14} className="mr-2 text-clarissa-secondary"/> {appointment.location}</p>}
        {appointment.attendees && appointment.attendees.length > 0 && (
            <p className="flex items-center"><Users size={14} className="mr-2 text-clarissa-secondary"/> {appointment.attendees.join(', ')}</p>
        )}
    </div>
    {appointment.notes && <p className="text-xs text-clarissa-text mt-1 italic">{appointment.notes}</p>}
  </Card>
);


interface ProjectDetailPageProps {
  projectId: string;
  navigateTo: (path: string) => void;
  projects: Project[]; // From App state (DB sourced)
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>; // To update App's local copy
  clients: Client[]; // From App state (DB sourced)
  tasks: Task[]; // Not migrated to DB in this step
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>; // Not migrated
  appointments: Appointment[]; // Not migrated
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; // Not migrated
  teamMembers: TeamUser[]; // From App state (DB sourced)
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ 
    projectId, navigateTo, projects, setProjects: setProjectsState, clients, 
    tasks, setTasks, appointments, setAppointments, teamMembers 
}) => {
  const [project, setProject] = useState<Project | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<PaymentType | null>(null);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseToEdit, setPhaseToEdit] = useState<ProjectPhaseType | null>(null);
  const [isSubPhaseModalOpen, setIsSubPhaseModalOpen] = useState(false);
  const [subPhaseToEdit, setSubPhaseToEdit] = useState<ProjectSubPhaseType | null>(null);
  const [parentPhaseForSubPhase, setParentPhaseForSubPhase] = useState<ProjectPhaseType | null>(null);
  
  const fetchProjectDetails = async () => {
      const dbProjects = await dbService.getProjects();
      const foundProject = dbProjects.find(p => p.id === projectId);
      if (foundProject) {
        const projectWithDefaults = {
          ...foundProject,
          detailedStages: foundProject.detailedStages || [],
          projectStyle: foundProject.projectStyle || PROJECT_STYLE_OPTIONS[0],
        };
        const clientDetails = clients.find(c => c.id === foundProject.client_id);
        setProject({ ...projectWithDefaults, client: clientDetails });
        setProjectsState(dbProjects); // Keep App state in sync
      } else {
        console.error("Project not found:", projectId);
        navigateTo('/projects'); 
      }
  };


  useEffect(() => {
    fetchProjectDetails();
  }, [projectId, clients]); // Depend on clients too, to ensure client data is available

  const updateProjectAndRefetch = async (updatedProject: Project) => {
    await dbService.updateProject(updatedProject);
    fetchProjectDetails(); // Re-fetch this project and update global project list
  };

  const handleProjectStyleChange = (newStyle: string) => {
    if(!project) return;
    const updatedProject = { ...project, projectStyle: newStyle };
    updateProjectAndRefetch(updatedProject);
  };

  const handleDetailedStagesChange = (newStages: ProjectStage[]) => {
    if(!project) return;
    const updatedProject = { ...project, detailedStages: newStages };
    updateProjectAndRefetch(updatedProject);
  }

  const handleOpenPaymentModal = (payment?: PaymentType) => {
    setPaymentToEdit(payment || null);
    setIsPaymentModalOpen(true);
  };
  const handleSavePayment = (paymentData: PaymentType) => {
    if (!project) return;
    const updatedPayments = paymentToEdit
      ? (project.payments || []).map(p => p.id === paymentData.id ? paymentData : p)
      : [...(project.payments || []), paymentData];
    const updatedProject = { ...project, payments: updatedPayments.sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) };
    updateProjectAndRefetch(updatedProject);
    setIsPaymentModalOpen(false);
  };
  const handleDeletePayment = (paymentId: string) => {
    if (!project || !window.confirm("Excluir este pagamento?")) return;
    const updatedPayments = (project.payments || []).filter(p => p.id !== paymentId);
    const updatedProject = { ...project, payments: updatedPayments };
    updateProjectAndRefetch(updatedProject);
  };

  const handleOpenPhaseModal = (phase?: ProjectPhaseType) => {
    setPhaseToEdit(phase || null);
    setIsPhaseModalOpen(true);
  };
  const handleSavePhase = (phaseData: ProjectPhaseType) => {
    if (!project) return;
    const updatedPhases = phaseToEdit
        ? (project.phases || []).map(p => p.id === phaseData.id ? phaseData : p)
        : [...(project.phases || []), { ...phaseData, order: (project.phases?.length || 0) + 1 }];
    const updatedProject = { ...project, phases: updatedPhases.sort((a,b) => a.order - b.order) };
    updateProjectAndRefetch(updatedProject);
    setIsPhaseModalOpen(false);
  };
  const handleDeletePhase = (phaseId: string) => {
    if (!project || !window.confirm("Excluir esta fase e todas as suas sub-fases?")) return;
    const updatedPhases = (project.phases || []).filter(p => p.id !== phaseId);
    const updatedProject = { ...project, phases: updatedPhases };
    updateProjectAndRefetch(updatedProject);
  };
  const handleTogglePhaseComplete = (phaseId: string) => {
    if (!project) return;
    const updatedPhases = (project.phases || []).map(p => 
      p.id === phaseId ? { ...p, completed: !p.completed } : p
    );
    const updatedProject = { ...project, phases: updatedPhases };
    updateProjectAndRefetch(updatedProject);
  };

  const handleOpenSubPhaseModal = (parentPhase: ProjectPhaseType, subPhase?: ProjectSubPhaseType) => {
    setParentPhaseForSubPhase(parentPhase);
    setSubPhaseToEdit(subPhase || null);
    setIsSubPhaseModalOpen(true);
  };
  const handleSaveSubPhase = (subPhaseData: ProjectSubPhaseType) => {
    if (!project || !parentPhaseForSubPhase) return;
    const updatedSubPhases = subPhaseToEdit
      ? (parentPhaseForSubPhase.subPhases || []).map(sp => sp.id === subPhaseData.id ? subPhaseData : sp)
      : [...(parentPhaseForSubPhase.subPhases || []), { ...subPhaseData, order: (parentPhaseForSubPhase.subPhases?.length || 0) + 1 }];
    
    const updatedPhases = (project.phases || []).map(p => 
      p.id === parentPhaseForSubPhase.id ? { ...p, subPhases: updatedSubPhases.sort((a,b) => a.order - b.order) } : p
    );
    const updatedProject = { ...project, phases: updatedPhases };
    updateProjectAndRefetch(updatedProject);
    setIsSubPhaseModalOpen(false);
  };
  const handleDeleteSubPhase = (parentPhaseId: string, subPhaseId: string) => {
    if (!project || !window.confirm("Excluir esta sub-fase?")) return;
    const updatedPhases = (project.phases || []).map(p => {
      if (p.id === parentPhaseId) {
        return { ...p, subPhases: (p.subPhases || []).filter(sp => sp.id !== subPhaseId) };
      }
      return p;
    });
    const updatedProject = { ...project, phases: updatedPhases };
    updateProjectAndRefetch(updatedProject);
  };
   const handleToggleSubPhaseComplete = (parentPhaseId: string, subPhaseId: string) => {
    if (!project) return;
    const updatedPhases = (project.phases || []).map(p => {
        if (p.id === parentPhaseId) {
            const updatedSubPhases = (p.subPhases || []).map(sp => 
                sp.id === subPhaseId ? { ...sp, completed: !sp.completed } : sp
            );
            return { ...p, subPhases: updatedSubPhases };
        }
        return p;
    });
    const updatedProject = { ...project, phases: updatedPhases };
    updateProjectAndRefetch(updatedProject);
  };


  const clientName = project?.client?.name || project?.clientName || 'Cliente não informado';
  const progress = project?.totalValue && project?.paidValue !== undefined && project.totalValue > 0 ? Math.round((project.paidValue / project.totalValue) * 100) : 0;
  const isOverdue = project?.due_date && new Date(project.due_date + 'T23:59:59Z') < new Date() && project?.status !== ProjectStatus.COMPLETED && project?.status !== ProjectStatus.CANCELED;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <Info size={16} /> },
    { id: 'phases', label: 'Fases (Cronograma)', icon: <ListChecks size={16} /> },
    { id: 'pricingStages', label: 'Precificação por Etapas', icon: <BarChart3 size={16} /> },
    { id: 'files', label: 'Arquivos', icon: <FileTextIcon size={16} /> },
    { id: 'tasks', label: 'Tarefas', icon: <ListChecks size={16} /> }, // Not DB migrated in this step
    { id: 'payments', label: 'Pagamentos', icon: <DollarSign size={16} /> },
    { id: 'contracts', label: 'Contratos', icon: <Briefcase size={16} /> },
    { id: 'agenda', label: 'Agenda', icon: <CalendarDays size={16} /> }, // Not DB migrated in this step
  ];
  
  if (!project) {
    return <div className="flex justify-center items-center h-full"><p className="text-clarissa-secondary">Carregando detalhes do projeto...</p></div>;
  }
  
  const remainingValue = (project.totalValue || 0) - (project.paidValue || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigateTo('/projects')} leftIcon={<ArrowLeft size={20} />} className="text-clarissa-primary">
          Voltar para Projetos
        </Button>
      </div>

      <Card className="p-6 bg-white">
        <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div>
                <h1 className="text-3xl font-bold text-clarissa-dark">{project.name}</h1>
                <p className="text-lg text-clarissa-secondary">{clientName} - {project.type}</p>
            </div>
            <Badge text={project.status} className="mt-2 md:mt-0 text-base px-3 py-1"/>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div><p className="text-clarissa-secondary">Data de Início</p><p className="font-medium text-clarissa-text">{formatDate(project.start_date)}</p></div>
            <div className={`${isOverdue ? 'text-clarissa-danger' : ''}`}><p className={`text-clarissa-secondary ${isOverdue ? '!text-clarissa-danger/80' : ''}`}>Data de Entrega</p><p className={`font-medium ${isOverdue ? 'font-bold' : 'text-clarissa-text'}`}>{formatDate(project.due_date)} {isOverdue && <AlertTriangle size={14} className="inline ml-1"/>}</p></div>
            <div><p className="text-clarissa-secondary">Valor Total</p><p className="font-medium text-clarissa-text">{formatCurrency(project.totalValue)}</p></div>
            <div><p className="text-clarissa-secondary">Valor Pago</p><p className="font-medium text-clarissa-success">{formatCurrency(project.paidValue)}</p></div>
        </div>
        {project.address && (<div className="mt-3 text-sm"><p className="text-clarissa-secondary">Endereço</p><p className="font-medium text-clarissa-text">{project.address}</p></div>)}
      </Card>

      <Tabs tabs={tabs} defaultTabId="overview">
        {(activeTabId) => (
          <div className="mt-0">
            {activeTabId === 'overview' && (
              <Card>
                <h3 className="text-xl font-semibold text-clarissa-dark mb-3">Detalhes do Projeto</h3>
                {project.notes && <p className="text-clarissa-text mb-4 whitespace-pre-wrap">{project.notes}</p>}
                {project.totalValue !== undefined && project.paidValue !== undefined && project.totalValue > 0 && (
                 <div className="my-4">
                    <div className="flex justify-between text-sm text-clarissa-secondary mb-1"><span>Progresso Financeiro</span><span className="font-semibold">{progress}%</span></div>
                    <div className="w-full bg-clarissa-lightgray rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso financeiro: ${progress}%`}><div className="bg-clarissa-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div>
                    <p className="text-xs text-clarissa-secondary mt-1">Restante a pagar: R$ {remainingValue.toFixed(2)}</p>
                 </div>
                )}
                <p className="text-xs text-clarissa-secondary mt-4">Criado em: {formatDate(project.createdAt, true)} | Última atualização: {formatDate(project.updatedAt, true)}</p>
              </Card>
            )}
            {activeTabId === 'phases' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenPhaseModal()} leftIcon={<PlusCircle size={16}/>}>Adicionar Fase</Button>
                    </div>
                    {(project.phases || []).sort((a,b)=>a.order-b.order).map(phase => 
                        <PhaseItem 
                            key={phase.id} 
                            phase={phase} 
                            onToggleComplete={() => handleTogglePhaseComplete(phase.id)}
                            onEdit={() => handleOpenPhaseModal(phase)}
                            onDelete={() => handleDeletePhase(phase.id)}
                            onAddSubPhase={() => handleOpenSubPhaseModal(phase)}
                            onToggleSubPhaseComplete={(subPhaseId) => handleToggleSubPhaseComplete(phase.id, subPhaseId)}
                            onEditSubPhase={(subPhase) => handleOpenSubPhaseModal(phase, subPhase)}
                            onDeleteSubPhase={(subPhaseId) => handleDeleteSubPhase(phase.id, subPhaseId)}
                        />
                    )}
                    {(!project.phases || project.phases.length === 0) && <p className="text-clarissa-secondary text-center py-4">Nenhuma fase cadastrada.</p>}
                </div>
            )}
             {activeTabId === 'pricingStages' && (
                <DetailedStagesPricingForm
                    stages={project.detailedStages || []}
                    setStages={handleDetailedStagesChange}
                    teamMembers={teamMembers}
                    projectStyle={project.projectStyle || PROJECT_STYLE_OPTIONS[0]}
                    onProjectStyleChange={handleProjectStyleChange}
                />
            )}
            {activeTabId === 'files' && (
                <div>
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => alert("Funcionalidade de adicionar arquivo em desenvolvimento.")} leftIcon={<PlusCircle size={16}/>}>Adicionar Arquivo</Button>
                    </div>
                    {project.files && project.files.length > 0 ? project.files.map(file => <FileItem key={file.id} file={file} />) 
                    : <p className="text-clarissa-secondary text-center py-4">Nenhum arquivo anexado.</p>}
                </div>
            )}
            {activeTabId === 'tasks' && ( // Tasks not migrated in this step
                <div>
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => alert("Funcionalidade de adicionar tarefa em desenvolvimento.")} leftIcon={<PlusCircle size={16}/>}>Adicionar Tarefa</Button>
                    </div>
                    {project.tasks && project.tasks.length > 0 ? project.tasks.map(task => <TaskItem key={task.id} task={task} />) 
                    : <p className="text-clarissa-secondary text-center py-4">Nenhuma tarefa associada.</p>}
                </div>
            )}
             {activeTabId === 'payments' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => handleOpenPaymentModal()} leftIcon={<PlusCircle size={16}/>}>Adicionar Pagamento</Button>
                    </div>
                    {(project.payments || []).sort((a,b)=> new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map(payment => 
                        <PaymentItem 
                            key={payment.id} 
                            payment={payment} 
                            onEdit={() => handleOpenPaymentModal(payment)}
                            onDelete={() => handleDeletePayment(payment.id)}
                        />
                    )}
                    {(!project.payments || project.payments.length === 0) && <p className="text-clarissa-secondary text-center py-4">Nenhum pagamento registrado.</p>}
                </div>
            )}
            {activeTabId === 'contracts' && (
                 <div>
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => alert("Funcionalidade de adicionar contrato em desenvolvimento.")} leftIcon={<PlusCircle size={16}/>}>Adicionar Contrato</Button>
                    </div>
                    {project.contracts && project.contracts.length > 0 ? project.contracts.map(contract => <ContractItem key={contract.id} contract={contract} />) 
                    : <p className="text-clarissa-secondary text-center py-4">Nenhum contrato associado.</p>}
                </div>
            )}
            {activeTabId === 'agenda' && ( // Agenda not migrated in this step
                <div>
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => alert("Funcionalidade de adicionar evento na agenda em desenvolvimento.")} leftIcon={<PlusCircle size={16}/>}>Adicionar Evento</Button>
                    </div>
                    {project.appointments && project.appointments.length > 0 ? project.appointments.map(appointment => <AppointmentItem key={appointment.id} appointment={appointment} />) 
                    : <p className="text-clarissa-secondary text-center py-4">Nenhum agendamento.</p>}
                </div>
            )}
          </div>
        )}
      </Tabs>

      <PaymentFormModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        paymentToEdit={paymentToEdit}
        projectId={project.id}
      />
      <PhaseFormModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onSave={handleSavePhase}
        phaseToEdit={phaseToEdit}
      />
      <SubPhaseFormModal
        isOpen={isSubPhaseModalOpen}
        onClose={() => setIsSubPhaseModalOpen(false)}
        onSave={handleSaveSubPhase}
        subPhaseToEdit={subPhaseToEdit}
      />
    </div>
  );
};

