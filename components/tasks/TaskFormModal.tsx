import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Task, TaskStatus, Project } from '../../types';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../../constants';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit?: Task | null;
  projects: Project[]; // To link task to a project
}

const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    // Check if it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Invalid date
        return date.toISOString().split('T')[0];
    } catch (e) {
        return ''; // Error parsing date
    }
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit, projects }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TO_DO);
  const [dueDate, setDueDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.due_date ? formatDateForInput(taskToEdit.due_date) : '');
      setResponsible(taskToEdit.responsible || '');
      setPriority(taskToEdit.priority || 'Média');
      setSelectedProjectId(taskToEdit.projectId || taskToEdit.project_id || undefined);
    } else {
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.TO_DO);
      setDueDate('');
      setResponsible(MOCK_USER.name); // Default to current user
      setPriority('Média');
      setSelectedProjectId(undefined);
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const taskData: Task = {
      id: taskToEdit?.id || `task-${Date.now()}`,
      title,
      description,
      status,
      due_date: dueDate || undefined,
      responsible,
      priority,
      projectId: selectedProjectId,
      project_id: selectedProjectId, // for compatibility
      projectName: selectedProject?.name, // Denormalized name
      order: taskToEdit?.order // Preserve order if editing
    };
    onSave(taskData);
    onClose();
  };

  const projectOptions = [
    { value: '', label: 'Nenhum projeto (Tarefa Geral)' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];
  
  const statusOptions = TASK_STATUS_OPTIONS.map(s => ({ value: s, label: s }));
  const priorityOptions = TASK_PRIORITY_OPTIONS.map(p => ({ value: p, label: p }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? "Editar Tarefa" : "Adicionar Nova Tarefa"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título da Tarefa" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} required />
          <Input label="Data de Prazo" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Responsável" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
          <Select label="Prioridade" options={priorityOptions} value={priority} onChange={(e) => setPriority(e.target.value as 'Baixa' | 'Média' | 'Alta')} />
        </div>
        <Select 
          label="Vincular ao Projeto (Opcional)" 
          options={projectOptions} 
          value={selectedProjectId || ''} 
          onChange={(e) => setSelectedProjectId(e.target.value || undefined)} 
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{taskToEdit ? "Salvar Alterações" : "Criar Tarefa"}</Button>
        </div>
      </form>
    </Modal>
  );
};

// Need to define MOCK_USER or import it if it's available globally, for defaulting responsible
// For now, let's assume MOCK_USER is available from constants
import { MOCK_USER } from '../../constants';
