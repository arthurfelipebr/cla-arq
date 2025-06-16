
import React, { useState, ChangeEvent } from 'react'; // Added ChangeEvent
import { ProjectStage, ProjectStageItem, User as TeamUser } from '../../types';
import { PROJECT_STYLE_OPTIONS } from '../../constants';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Trash2, PlusCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';

interface DetailedStagesPricingFormProps {
  stages: ProjectStage[];
  setStages: (stages: ProjectStage[]) => void;
  teamMembers: TeamUser[];
  projectStyle: string;
  onProjectStyleChange: (style: string) => void;
  isReadOnly?: boolean;
  isCompact?: boolean; // New prop for compact styling
}

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) {
        return 'R$ 0,00';
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const DetailedStagesPricingForm: React.FC<DetailedStagesPricingFormProps> = ({
  stages,
  setStages,
  teamMembers,
  projectStyle,
  onProjectStyleChange,
  isReadOnly = false,
  isCompact = false, // Default to false
}) => {
  const [editingStageName, setEditingStageName] = useState<{ stageId: string; name: string } | null>(null);

  const teamMemberOptions = [{ value: '', label: 'Selecione...' }, ...teamMembers.map(tm => ({ value: tm.id, label: tm.name }))];

  const handleAddStage = () => {
    if (isReadOnly) return;
    const newStage: ProjectStage = {
      id: `dstage-${Date.now()}`,
      name: `Nova Etapa ${(stages?.length || 0) + 1}`,
      items: [],
      isCollapsed: false,
    };
    setStages([...(stages || []), newStage]);
  };

  const handleToggleStageCollapse = (stageId: string) => {
    // No full save on collapse/expand, just visual update and recalculation
    setStages(
      (stages || []).map(stage =>
        stage.id === stageId ? { ...stage, isCollapsed: !stage.isCollapsed } : stage
      )
    );
  };

  const handleUpdateStageName = (stageId: string, newName: string) => {
    if (isReadOnly) return;
    setStages(
      (stages || []).map(stage =>
        stage.id === stageId ? { ...stage, name: newName } : stage
      )
    );
    setEditingStageName(null);
  };

  const handleRemoveStage = (stageId: string) => {
    if (isReadOnly || !window.confirm("Tem certeza que deseja remover esta etapa e todos os seus itens?")) return;
    setStages((stages || []).filter(stage => stage.id !== stageId));
  };

  const handleAddItem = (stageId: string) => {
    if (isReadOnly) return;
    const newItem: ProjectStageItem = {
      id: `dsitem-${Date.now()}`,
      name: 'Novo Item de Projeto',
      hours: 0,
    };
    setStages(
      (stages || []).map(stage =>
        stage.id === stageId ? { ...stage, items: [...stage.items, newItem] } : stage
      )
    );
  };

  const handleDuplicateItem = (stageId: string, itemId: string) => {
    if (isReadOnly) return;
    
    const updatedStages = (stages || []).map(stage => {
        if (stage.id === stageId) {
            const itemToDuplicate = stage.items.find(item => item.id === itemId);
            if (itemToDuplicate) {
                const itemIndex = stage.items.findIndex(item => item.id === itemId);
                const duplicatedItem: ProjectStageItem = {
                    ...itemToDuplicate,
                    id: `dsitem-${Date.now()}`, 
                };
                const newItems = [
                    ...stage.items.slice(0, itemIndex + 1),
                    duplicatedItem,
                    ...stage.items.slice(itemIndex + 1)
                ];
                return { ...stage, items: newItems };
            }
        }
        return stage;
    });
    setStages(updatedStages);
  };

  const handleRemoveItem = (stageId: string, itemId: string) => {
    if (isReadOnly || !window.confirm("Remover este item da etapa?")) return;
    setStages(
      (stages || []).map(stage =>
        stage.id === stageId ? { ...stage, items: stage.items.filter(item => item.id !== itemId) } : stage
      )
    );
  };

  const handleUpdateItem = (stageId: string, itemId: string, field: keyof ProjectStageItem, value: any) => {
    if (isReadOnly) return;
    setStages(
      (stages || []).map(stage => {
        if (stage.id === stageId) {
          return {
            ...stage,
            items: stage.items.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          };
        }
        return stage;
      })
    );
  };

  const gapClass = isCompact ? 'gap-x-2' : 'gap-x-3';
  const compactInputClass = isCompact ? '!py-1.5 !px-2 !h-7 !text-xs' : '';
  const compactButtonClass = isCompact ? '!py-1 !px-1.5 !text-xs' : '';
  const compactIconSize = isCompact ? 12 : 14;
  const compactChevronSize = isCompact ? 16 : 20;


  return (
    <div className={`${isCompact ? 'space-y-2.5' : 'space-y-4'}`}>
      {!isReadOnly && (
        <Card className={`!py-3 !px-4 ${isCompact ? '!mb-2.5' : '!mb-3'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Estilo do projeto"
              options={PROJECT_STYLE_OPTIONS.map(s => ({ value: s, label: s }))}
              value={projectStyle || ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onProjectStyleChange(e.target.value)}
              disabled={isReadOnly}
              className={compactInputClass}
              labelClassName={isCompact ? '!text-xs' : ''}
              containerClassName={isCompact ? 'mb-0' : ''}
            />
          </div>
        </Card>
      )}

      {(stages || []).map(stage => {
        const stageTotalCost = stage.items.reduce((acc, currentItem) => {
          const responsible = teamMembers.find(tm => tm.id === currentItem.responsibleId);
          const hourlyRate = responsible?.hourlyRate || 0;
          return acc + (currentItem.hours || 0) * hourlyRate;
        }, 0);

        return (
          <Card key={stage.id} className={`bg-white ${isCompact ? '!p-2.5 !mb-2.5' : '!p-4 !mb-3'}`}
            title={
              editingStageName?.stageId === stage.id && !isReadOnly ? (
                <Input
                  value={editingStageName.name}
                  onChange={(e) => setEditingStageName({ ...editingStageName, name: e.target.value })}
                  onBlur={() => handleUpdateStageName(stage.id, editingStageName.name)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateStageName(stage.id, editingStageName.name)}
                  autoFocus
                  className={`text-lg font-semibold !p-0 text-clarissa-dark ${isCompact ? '!text-base !h-7' : ''}`}
                  disabled={isReadOnly}
                />
              ) : (
                <span
                  className={`font-semibold text-clarissa-dark truncate ${isCompact ? 'text-base' : 'text-lg'} ${!isReadOnly ? 'hover:bg-clarissa-lightgray/50 px-1 py-0.5 rounded cursor-pointer' : 'px-1 py-0.5'}`}
                  onClick={() => !isReadOnly && setEditingStageName({ stageId: stage.id, name: stage.name })}
                  title={stage.name}
                >
                  {stage.name}
                </span>
              )
            }
            actions={
              <div className="flex items-center space-x-2">
                {!isReadOnly && (
                  <Button variant="danger" size="sm" onClick={() => handleRemoveStage(stage.id)} leftIcon={<Trash2 size={compactIconSize} />} className={compactButtonClass}>Remover etapa</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleToggleStageCollapse(stage.id)} className="p-1">
                  {stage.isCollapsed ? <ChevronDown size={compactChevronSize} /> : <ChevronUp size={compactChevronSize} />}
                </Button>
              </div>
            }
          >
            {!stage.isCollapsed && (
              <div className={`mt-2.5 space-y-2`}>
                <div className={`grid grid-cols-12 ${gapClass} gap-y-1 text-xs font-medium text-clarissa-secondary px-1 ${isCompact ? 'pb-1 mb-1' : 'pb-2 mb-2'}`}>
                  <div className="col-span-4">Item de Projeto</div>
                  <div className="col-span-3">Responsável</div>
                  <div className="col-span-1 text-center">Tempo (h)</div>
                  <div className="col-span-2 text-right">Total do item</div>
                  <div className="col-span-2 text-right pr-1">Ações</div>
                </div>
                {stage.items.map(item => {
                  const responsible = teamMembers.find(tm => tm.id === item.responsibleId);
                  const hourlyRate = responsible?.hourlyRate || 0;
                  const itemCost = (item.hours || 0) * hourlyRate;
                  return (
                    <div key={item.id} className={`grid grid-cols-12 ${gapClass} gap-y-1 items-center border-t border-clarissa-lightgray/50 ${isCompact ? 'pt-1.5' : 'pt-2.5'}`}>
                      <div className="col-span-4">
                        <Input
                          value={item.name}
                          onChange={e => handleUpdateItem(stage.id, item.id, 'name', e.target.value)}
                          placeholder="Nome do item"
                          className={`text-sm truncate ${compactInputClass}`}
                          disabled={isReadOnly}
                          title={item.name}
                        />
                      </div>
                      <div className="col-span-3">
                        <Select
                          options={teamMemberOptions}
                          value={item.responsibleId || ''}
                          onChange={e => handleUpdateItem(stage.id, item.id, 'responsibleId', e.target.value)}
                          className={`text-sm ${compactInputClass}`}
                          disabled={isReadOnly}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={item.hours === undefined ? '' : String(item.hours)}
                          onChange={e => handleUpdateItem(stage.id, item.id, 'hours', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          placeholder="h"
                          className={`text-sm text-center ${compactInputClass}`}
                          disabled={isReadOnly}
                          step="0.01"
                        />
                      </div>
                      <div className={`col-span-2 text-right text-sm font-medium text-clarissa-dark bg-clarissa-background/70 p-1 rounded-md ${isCompact ? '!text-xs !py-1' : ''}`}>
                        {formatCurrency(itemCost)}
                      </div>
                      <div className="col-span-2 flex justify-end space-x-0.5">
                        {!isReadOnly && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicateItem(stage.id, item.id)} className="p-0.5" title="Duplicar Item">
                              <Copy size={compactIconSize} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(stage.id, item.id)} className="p-0.5 text-clarissa-danger" title="Remover Item">
                              <Trash2 size={compactIconSize} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!isReadOnly && (
                  <div className={isCompact ? 'pt-1.5' : 'pt-2'}>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem(stage.id)} leftIcon={<PlusCircle size={16} />} className={isCompact ? '!py-1 !text-xs' : ''}>Adicionar item</Button>
                  </div>
                )}
                <div className={`mt-2 pt-2 border-t border-clarissa-secondary/20 flex justify-end items-center ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <span className="font-semibold text-clarissa-dark">Total da Etapa:</span>
                  <span className={`ml-2 font-bold text-clarissa-primary ${isCompact ? 'text-sm' : 'text-base'}`}>{formatCurrency(stageTotalCost)}</span>
                </div>
              </div>
            )}
          </Card>
        )
      })}
      {!isReadOnly && (
        <div className={isCompact ? 'mt-2.5' : 'mt-4'}>
          <Button variant="primary" onClick={handleAddStage} leftIcon={<PlusCircle size={18} />} className={isCompact ? '!py-1.5 !text-sm' : ''}>Nova etapa de precificação</Button>
        </div>
      )}
    </div>
  );
};
