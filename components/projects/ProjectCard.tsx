
import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CalendarDays, User, Briefcase, MoreVertical, Eye, Edit3, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  // Ensure date is treated as UTC to avoid timezone issues with substring
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const progress = project.totalValue && project.paidValue !== undefined ? Math.round((project.paidValue / project.totalValue) * 100) : 0;
  const isOverdue = project.due_date && new Date(project.due_date + 'T23:59:59Z') < new Date() && project.status !== ProjectStatus.COMPLETED && project.status !== ProjectStatus.CANCELED;

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-float transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 
            className="text-xl font-semibold text-clarissa-primary hover:underline cursor-pointer" 
            onClick={() => onViewDetails(project.id)}
            title={`Ver detalhes de ${project.name}`}
          >
            {project.name}
          </h3>
          <div className="relative" ref={menuRef}>
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1" aria-label="Opções do projeto" aria-expanded={isMenuOpen} aria-haspopup="true">
              <MoreVertical size={20} className="text-clarissa-secondary" />
            </Button>
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-clarissa-lightgray py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <button
                  onClick={() => { onViewDetails(project.id); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-clarissa-dark hover:bg-clarissa-background flex items-center"
                  role="menuitem"
                >
                  <Eye size={16} className="mr-2" /> Ver Detalhes
                </button>
                <button
                  onClick={() => { onEdit(project.id); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-clarissa-dark hover:bg-clarissa-background flex items-center"
                  role="menuitem"
                >
                  <Edit3 size={16} className="mr-2" /> Editar
                </button>
                <button
                  onClick={() => { onDelete(project.id); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-clarissa-danger hover:bg-clarissa-background flex items-center"
                  role="menuitem"
                >
                  <Trash2 size={16} className="mr-2" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-clarissa-text mb-4">
          <div className="flex items-center">
            <User size={16} className="mr-2 text-clarissa-secondary flex-shrink-0" />
            <span className="truncate" title={project.clientName || project.client_id}>{project.clientName || project.client_id}</span>
          </div>
          <div className="flex items-center">
            <Briefcase size={16} className="mr-2 text-clarissa-secondary flex-shrink-0" />
            <span>{project.type}</span>
          </div>
          <div className={`flex items-center ${isOverdue ? 'text-clarissa-danger font-semibold' : ''}`}>
            <CalendarDays size={16} className="mr-2 text-clarissa-secondary flex-shrink-0" />
            <span>Entrega: {formatDate(project.due_date)}</span>
            {isOverdue && <span className="ml-2 px-1.5 py-0.5 text-xs bg-clarissa-danger/10 text-clarissa-danger rounded-full">Atrasado</span>}
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        {project.totalValue !== undefined && project.paidValue !== undefined && project.totalValue > 0 && (
             <div className="mb-2">
                <div className="flex justify-between text-xs text-clarissa-secondary mb-1">
                    <span>Progresso Financeiro</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-clarissa-lightgray rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso financeiro do projeto: ${progress}%`}>
                    <div 
                        className="bg-clarissa-primary h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        )}
        <div className="flex justify-between items-center pt-2">
          <Badge text={project.status} />
          <p className="text-xs text-clarissa-secondary">
            Início: {formatDate(project.start_date)}
          </p>
        </div>
      </div>
    </Card>
  );
};
