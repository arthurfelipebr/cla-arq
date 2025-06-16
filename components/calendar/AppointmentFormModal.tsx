import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Appointment, AppointmentType, Project, Task } from '../../types';
import { APPOINTMENT_TYPE_OPTIONS } from '../../constants';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  appointmentToEdit?: Appointment | null;
  projects: Project[];
  tasks: Task[]; // For linking appointments to tasks
  initialDate?: string; // YYYY-MM-DD string for pre-filling date
}

// Helper to format date and time for datetime-local input
const formatDateTimeForInput = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    // Correctly formats to 'YYYY-MM-DDTHH:mm'
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
};


export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ isOpen, onClose, onSave, appointmentToEdit, projects, tasks, initialDate }) => {
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState(''); // Comma-separated string
  const [type, setType] = useState<AppointmentType>(AppointmentType.GENERAL);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isAllDay, setIsAllDay] = useState(false);


  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title);
      setDateTime(formatDateTimeForInput(appointmentToEdit.date_time));
      setEndDateTime(appointmentToEdit.end_date_time ? formatDateTimeForInput(appointmentToEdit.end_date_time) : '');
      setLocation(appointmentToEdit.location || '');
      setNotes(appointmentToEdit.notes || '');
      setAttendees((appointmentToEdit.attendees || []).join(', '));
      setType(appointmentToEdit.type);
      setSelectedProjectId(appointmentToEdit.projectId);
      setIsAllDay(!!appointmentToEdit.isAllDay);
      if (appointmentToEdit.type === AppointmentType.TASK_DEADLINE) {
        setSelectedTaskId(appointmentToEdit.relatedId);
      } else {
        setSelectedTaskId(undefined);
      }
    } else {
      setTitle('');
      setDateTime(initialDate ? formatDateTimeForInput(new Date(initialDate + 'T09:00:00').toISOString()) : '');
      setEndDateTime('');
      setLocation('');
      setNotes('');
      setAttendees('');
      setType(AppointmentType.GENERAL);
      setSelectedProjectId(undefined);
      setSelectedTaskId(undefined);
      setIsAllDay(false);
    }
  }, [appointmentToEdit, isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDateTime = dateTime;
    let finalEndDateTime = endDateTime;

    if(isAllDay) {
        const startDate = dateTime.split('T')[0];
        finalDateTime = `${startDate}T00:00:00`;
        finalEndDateTime = `${startDate}T23:59:59`;
    }


    const appointmentData: Appointment = {
      id: appointmentToEdit?.id || `appt-${Date.now()}`,
      title,
      date_time: new Date(finalDateTime).toISOString(),
      end_date_time: finalEndDateTime ? new Date(finalEndDateTime).toISOString() : undefined,
      location,
      notes,
      attendees: attendees.split(',').map(a => a.trim()).filter(a => a),
      type,
      projectId: type === AppointmentType.PROJECT_MEETING ? selectedProjectId : undefined,
      relatedId: type === AppointmentType.TASK_DEADLINE ? selectedTaskId : undefined,
      isAllDay,
    };
    onSave(appointmentData);
    onClose();
  };

  const projectOptions = [{ value: '', label: 'Nenhum (Evento Geral)' }, ...projects.map(p => ({ value: p.id, label: p.name }))];
  const taskOptions = [{ value: '', label: 'Nenhuma Tarefa Específica' }, ...tasks.filter(t => !t.projectId || t.projectId === selectedProjectId).map(t => ({ value: t.id, label: `${t.title} ${t.projectName ? '('+t.projectName+')' : ''}`}))];
  const typeOptions = APPOINTMENT_TYPE_OPTIONS.map(t => ({ value: t, label: t }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={appointmentToEdit ? "Editar Evento" : "Adicionar Novo Evento"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título do Evento" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <div className="flex items-center space-x-2">
            <Input 
                label="Data e Hora de Início" 
                type="datetime-local" 
                value={dateTime} 
                onChange={(e) => setDateTime(e.target.value)} 
                required 
                disabled={isAllDay}
                className="flex-grow"
            />
             <div className="pt-7">
                <input type="checkbox" id="isAllDay" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="mr-2 h-4 w-4 text-clarissa-primary focus:ring-clarissa-primary border-gray-300 rounded"/>
                <label htmlFor="isAllDay" className="text-sm text-clarissa-dark">Dia inteiro</label>
            </div>
        </div>
        {!isAllDay && <Input label="Data e Hora de Término (Opcional)" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} />}

        <Input label="Local (Opcional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select label="Tipo de Evento" options={typeOptions} value={type} onChange={(e) => setType(e.target.value as AppointmentType)} />

        {type === AppointmentType.PROJECT_MEETING && (
          <Select label="Vincular ao Projeto" options={projectOptions} value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(e.target.value || undefined)} />
        )}
        {type === AppointmentType.TASK_DEADLINE && (
          <>
            <Select label="Vincular ao Projeto (Filtro de Tarefas)" options={projectOptions} value={selectedProjectId || ''} onChange={(e) => {setSelectedProjectId(e.target.value || undefined); setSelectedTaskId(undefined);}} />
            <Select label="Vincular à Tarefa" options={taskOptions} value={selectedTaskId || ''} onChange={(e) => setSelectedTaskId(e.target.value || undefined)} />
          </>
        )}

        <Textarea label="Observações (Opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <Input label="Participantes (separados por vírgula, opcional)" value={attendees} onChange={(e) => setAttendees(e.target.value)} />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{appointmentToEdit ? "Salvar Alterações" : "Criar Evento"}</Button>
        </div>
      </form>
    </Modal>
  );
};
