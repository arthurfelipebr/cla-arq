import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Inspection, InspectionStatus, InspectionType, Client } from '../../types';
import { INSPECTION_STATUS_OPTIONS, INSPECTION_TYPE_OPTIONS } from '../../constants';

interface InspectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inspection: Inspection) => void;
  inspectionToEdit?: Inspection | null;
  clients: Client[];
}

const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString; // Already YYYY-MM-DD
    try {
        // Attempt to parse ISO string or other common formats correctly
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Invalid date
        return date.toISOString().split('T')[0];
    } catch (e) {
        return ''; // Error parsing date
    }
};


export const InspectionFormModal: React.FC<InspectionFormModalProps> = ({ isOpen, onClose, onSave, inspectionToEdit, clients }) => {
  const [clientId, setClientId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [inspectionType, setInspectionType] = useState<InspectionType>(InspectionType.PROPERTY_VALUATION);
  const [status, setStatus] = useState<InspectionStatus>(InspectionStatus.SCHEDULED);
  const [channel, setChannel] = useState('');
  const [bank, setBank] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [address, setAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [slaLimit, setSlaLimit] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (inspectionToEdit) {
      setClientId(inspectionToEdit.client_id);
      setIdentifier(inspectionToEdit.identifier);
      setInspectionType(inspectionToEdit.inspection_type);
      setStatus(inspectionToEdit.status);
      setChannel(inspectionToEdit.channel || '');
      setBank(inspectionToEdit.bank || '');
      setCostCenter(inspectionToEdit.cost_center || '');
      setAddress(inspectionToEdit.address);
      setScheduledDate(formatDateForInput(inspectionToEdit.scheduled_date));
      setDueDate(formatDateForInput(inspectionToEdit.due_date));
      setSlaLimit(inspectionToEdit.sla_limit || '');
      setNotes(inspectionToEdit.notes || '');
    } else {
      // Reset form
      setClientId(''); setIdentifier(''); setInspectionType(InspectionType.PROPERTY_VALUATION);
      setStatus(InspectionStatus.SCHEDULED); setChannel(''); setBank(''); setCostCenter('');
      setAddress(''); setScheduledDate(''); setDueDate(''); setSlaLimit(''); setNotes('');
    }
  }, [inspectionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
        alert("Por favor, selecione um cliente.");
        return;
    }
    const selectedClient = clients.find(c => c.id === clientId);
    const inspectionData: Inspection = {
      id: inspectionToEdit?.id || `insp-${Date.now()}`,
      client_id: clientId,
      clientName: selectedClient?.name,
      identifier,
      inspection_type: inspectionType,
      status,
      channel,
      bank,
      cost_center: costCenter,
      address,
      scheduled_date: scheduledDate,
      due_date: dueDate,
      sla_limit: slaLimit,
      notes,
      createdAt: inspectionToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(inspectionData);
    onClose();
  };
  
  const clientOptions = [{value: '', label: 'Selecione um Cliente'}, ...clients.map(c => ({ value: c.id, label: c.name }))];
  const typeOptions = INSPECTION_TYPE_OPTIONS.map(s => ({ value: s, label: s }));
  const statusOptions = INSPECTION_STATUS_OPTIONS.map(s => ({ value: s, label: s }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={inspectionToEdit ? "Editar Inspeção" : "Adicionar Nova Inspeção"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Cliente" options={clientOptions} value={clientId} onChange={(e) => setClientId(e.target.value)} required />
            <Input label="Identificador da Inspeção" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Ex: LAUDO-001, VIST-ABC" required />
        </div>
        <Input label="Endereço da Inspeção" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select label="Tipo de Inspeção" options={typeOptions} value={inspectionType} onChange={(e) => setInspectionType(e.target.value as InspectionType)} required />
            <Select label="Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as InspectionStatus)} required />
            <Input label="Canal (Origem)" value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Ex: Banco, Indicação" />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Banco (se aplicável)" value={bank} onChange={(e) => setBank(e.target.value)} />
            <Input label="Centro de Custo" value={costCenter} onChange={(e) => setCostCenter(e.target.value)} />
            <Input label="Limite SLA" value={slaLimit} onChange={(e) => setSlaLimit(e.target.value)} placeholder="Ex: 5 dias úteis" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Data Agendada" type="datetime-local" value={scheduledDate ? scheduledDate.includes('T') ? scheduledDate : (scheduledDate + 'T00:00') : ''} onChange={(e) => setScheduledDate(e.target.value)} required />
            <Input label="Data de Prazo (Entrega)" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <Textarea label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{inspectionToEdit ? "Salvar Alterações" : "Criar Inspeção"}</Button>
        </div>
      </form>
    </Modal>
  );
};
