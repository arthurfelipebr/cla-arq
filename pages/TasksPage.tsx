import React from 'react';
import { Card } from '../components/common/Card';
import { Task, Project } from '../types';
import { Dispatch, SetStateAction } from 'react';

interface TasksPageProps {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  projects: Project[];
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, setTasks, projects }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-clarissa-dark mb-6">Tarefas</h1>
      <Card title="Quadro Kanban de Tarefas">
        <p className="text-clarissa-secondary">Conteúdo da página de tarefas (Kanban) aparecerá aqui.</p>
        {/* TODO: Implement Kanban board for tasks */}
      </Card>
    </div>
  );
};