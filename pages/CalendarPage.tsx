import React from 'react';
import { Card } from '../components/common/Card';
import { Appointment, Project, Task, Inspection } from '../types';
import { Dispatch, SetStateAction } from 'react';

interface CalendarPageProps {
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  projects: Project[];
  tasks: Task[];
  inspections: Inspection[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ appointments, setAppointments, projects, tasks, inspections }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-clarissa-dark mb-6">Agenda</h1>
      <Card title="Calendário de Eventos">
        <p className="text-clarissa-secondary">Conteúdo da página de agenda/calendário aparecerá aqui.</p>
        {/* TODO: Implement calendar view and event management */}
      </Card>
    </div>
  );
};