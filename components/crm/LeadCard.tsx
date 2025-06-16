
import React from 'react';
import { Lead } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Briefcase, Calendar, DollarSign, Edit3, Trash2, User, MoreVertical, Settings2, CheckSquare, Eye } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onViewDetails: (leadId: string) => void; // Changed from onSimulateCosts
  onConvertToProject: (lead: Lead) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
   if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) { // Handle YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete, onViewDetails, onConvertToProject }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid navigation if a button or the menu itself was clicked
    if ((e.target as HTMLElement).closest('button') || (menuRef.current && menuRef.current.contains(e.target as Node))) {
      return;
    }
    onViewDetails(lead.id);
  };

  return (
    <Card 
      className="flex flex-col justify-between h-full hover:shadow-float transition-all duration-300 cursor-pointer"
      onClick={handleCardClick} // Make the whole card clickable for navigation
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-clarissa-primary truncate" title={lead.potentialClientName}>
            <User size={18} className="inline mr-2 opacity-80" />{lead.potentialClientName}
          </h3>
           <div className="relative" ref={menuRef}>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen);}} className="p-1 -mr-1 -mt-1" aria-label="Opções da oportunidade" aria-expanded={isMenuOpen}>
              <MoreVertical size={20} className="text-clarissa-secondary" />
            </Button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-clarissa-lightgray py-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onViewDetails(lead.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-clarissa-dark hover:bg-clarissa-background flex items-center"><Eye size={16} className="mr-2"/>Ver Detalhes/Simular</button>
                <button onClick={() => { onConvertToProject(lead); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-clarissa-dark hover:bg-clarissa-background flex items-center"><CheckSquare size={16} className="mr-2"/>Converter para Projeto</button>
                <div className="my-1 border-t border-clarissa-lightgray/50"></div>
                <button onClick={() => { onEdit(lead); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-clarissa-dark hover:bg-clarissa-background flex items-center"><Edit3 size={16} className="mr-2"/>Editar Oportunidade</button>
                <button onClick={() => { onDelete(lead.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-clarissa-danger hover:bg-clarissa-background flex items-center"><Trash2 size={16} className="mr-2"/>Excluir Oportunidade</button>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-clarissa-text mb-1 h-10 overflow-hidden line-clamp-2" title={lead.projectDescription}>
          <Briefcase size={14} className="inline mr-1.5 opacity-70" />{lead.projectDescription}
        </p>
        {lead.estimatedValue && (
          <p className="text-sm text-clarissa-secondary mb-1">
            <DollarSign size={14} className="inline mr-1.5 opacity-70" />
            Estimado: R$ {lead.estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
        {lead.nextActionDate && (
          <p className="text-sm text-clarissa-secondary mb-3">
            <Calendar size={14} className="inline mr-1.5 opacity-70" />
            Próxima Ação: {formatDate(lead.nextActionDate)}
          </p>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-clarissa-lightgray/30 flex justify-between items-center">
        <Badge text={lead.status} />
        <span className="text-xs text-clarissa-secondary">
          Criado: {formatDate(lead.createdAt)}
        </span>
      </div>
    </Card>
  );
};
