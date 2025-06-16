
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Lead, LeadStatus, LeadSource, TeamMemberConfigItem, User as TeamUser } from '../../types'; // Added TeamMemberConfigItem
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '../../constants';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  leadToEdit?: Lead | null;
  teamMembers: TeamUser[]; // Changed from TeamMemberConfigItem to User for consistency
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

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSave, leadToEdit, teamMembers }) => {
  const [potentialClientName, setPotentialClientName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [status, setStatus] = useState<LeadStatus>(LeadStatus.NEW);
  const [source, setSource] = useState<LeadSource | undefined>(undefined);
  const [estimatedValue, setEstimatedValue] = useState<number | ''>('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (leadToEdit) {
      setPotentialClientName(leadToEdit.potentialClientName);
      setContactEmail(leadToEdit.contactEmail || '');
      setContactPhone(leadToEdit.contactPhone || '');
      setProjectDescription(leadToEdit.projectDescription);
      setStatus(leadToEdit.status);
      setSource(leadToEdit.source);
      setEstimatedValue(leadToEdit.estimatedValue || '');
      setNextActionDate(leadToEdit.nextActionDate ? formatDateForInput(leadToEdit.nextActionDate) : '');
      setNotes(leadToEdit.notes || '');
      setResponsibleUserId(leadToEdit.responsibleUserId);
    } else {
      // Reset form for new lead
      setPotentialClientName('');
      setContactEmail('');
      setContactPhone('');
      setProjectDescription('');
      setStatus(LeadStatus.NEW);
      setSource(undefined);
      setEstimatedValue('');
      setNextActionDate('');
      setNotes('');
      setResponsibleUserId(undefined);
    }
  }, [leadToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const leadData: Lead = {
      id: leadToEdit?.id || `lead-${Date.now()}`,
      potentialClientName,
      contactEmail,
      contactPhone,
      projectDescription,
      status,
      source,
      estimatedValue: estimatedValue === '' ? undefined : Number(estimatedValue),
      nextActionDate: nextActionDate || undefined,
      notes,
      responsibleUserId,
      costSimulationId: leadToEdit?.costSimulationId, 
      createdAt: leadToEdit?.createdAt || now,
      updatedAt: now,
    };
    onSave(leadData);
  };

  const statusOptions = LEAD_STATUS_OPTIONS.map(s => ({ value: s, label: s }));
  const sourceOptions = [{value: '', label: 'Não especificada'}, ...LEAD_SOURCE_OPTIONS.map(s => ({ value: s, label: s }))];
  const responsibleOptions = [{value: '', label: 'Não atribuído'}, ...teamMembers.map(tm => ({ value: tm.id, label: tm.name }))];


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={leadToEdit ? "Editar Oportunidade" : "Adicionar Nova Oportunidade"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Nome do Cliente Potencial" 
          value={potentialClientName} 
          onChange={(e) => setPotentialClientName(e.target.value)} 
          required 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="E-mail de Contato" 
            type="email" 
            value={contactEmail} 
            onChange={(e) => setContactEmail(e.target.value)} 
          />
          <Input 
            label="Telefone de Contato" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
          />
        </div>
        <Textarea 
          label="Breve Descrição do Projeto" 
          value={projectDescription} 
          onChange={(e) => setProjectDescription(e.target.value)} 
          required 
          rows={3}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Status da Oportunidade" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} required />
          <Select label="Fonte da Oportunidade" options={sourceOptions} value={source || ''} onChange={(e) => setSource(e.target.value as LeadSource || undefined)} />
        </div>
         <Select 
            label="Responsável pela Oportunidade" 
            options={responsibleOptions} 
            value={responsibleUserId || ''} 
            onChange={(e) => setResponsibleUserId(e.target.value || undefined)} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Valor Estimado (R$)" 
            type="number" 
            step="0.01" 
            value={estimatedValue} 
            onChange={(e) => setEstimatedValue(e.target.value === '' ? '' : parseFloat(e.target.value))} 
          />
          <Input 
            label="Data da Próxima Ação" 
            type="date" 
            value={nextActionDate} 
            onChange={(e) => setNextActionDate(e.target.value)} 
          />
        </div>
        <Textarea 
          label="Observações Adicionais" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows={3}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{leadToEdit ? "Salvar Alterações" : "Criar Oportunidade"}</Button>
        </div>
      </form>
    </Modal>
  );
};
