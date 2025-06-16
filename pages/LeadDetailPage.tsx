
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Lead, CostSimulation, Client, Project, OfficeCostConfigItem, TeamMemberConfigItem, User as TeamUser, LeadStatus, ProjectType, ProjectStatus, CostItem, ComplexityFactorItem, ProjectStage } from '../types';
import { Button } from '../components/common/Button';
import { Input, Textarea } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { Tabs } from '../components/common/Tabs';
import { Badge } from '../components/common/Badge';
import { LeadFormModal } from '../components/crm/LeadFormModal';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { DetailedStagesPricingForm } from '../components/projects/DetailedStagesPricingForm';
import { ArrowLeft, Edit3, PlusCircle, DollarSign, Save, Trash2, CheckSquare as CheckSquareIcon, Archive, Info, BarChart3, Settings2, XSquare } from 'lucide-react';
import { DEFAULT_COMPLEXITY_FACTORS_TEMPLATE, DEFAULT_PROJECT_DETAILED_STAGES_TEMPLATE, PROJECT_STYLE_OPTIONS, MOCK_USER } from '../constants';
import * as dbService from '../services/databaseService';


interface LeadDetailPageProps {
  leadId: string;
  navigateTo: (path: string) => void;
  leads: Lead[]; // From App state (DB sourced)
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>; // To update App's local copy
  costSimulations: CostSimulation[]; // From App state (DB sourced)
  setCostSimulations: React.Dispatch<React.SetStateAction<CostSimulation[]>>; // To update App's local copy
  clients: Client[]; // From App state (DB sourced)
  setClients: React.Dispatch<React.SetStateAction<Client[]>>; // To update App's local copy
  projects: Project[]; // From App state (DB sourced)
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>; // To update App's local copy
  officeCostConfigs: OfficeCostConfigItem[]; // From App state (DB sourced)
  teamMemberConfigs: TeamMemberConfigItem[]; // From App state (DB sourced)
  teamMembers: TeamUser[]; // From App state (DB sourced)
}

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

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getAppliedConfigItems = <
  ConfigT extends { id: string; name: string; isArchived?: boolean },
  SimT extends { configItemId?: string; isApplied?: boolean; quantity?: number }
>(
  configs: ConfigT[],
  simulatedItems: SimT[],
  mapFn: (configItem: ConfigT, isApplied: boolean, quantity: number) => CostItem,
  defaultQuantity: number
): CostItem[] => {
  return configs
    .filter(config => !config.isArchived)
    .map(config => {
      const existingSimItem = simulatedItems.find(sim => sim.configItemId === config.id);
      const quantity = (existingSimItem && typeof existingSimItem.quantity === 'number') ? existingSimItem.quantity : defaultQuantity;
      return mapFn(config, existingSimItem ? !!existingSimItem.isApplied : true, quantity);
    });
};

interface SimSectionProps {
  title: string;
  total?: number;
  onAddItem?: () => void;
  children: React.ReactNode;
  cardClassName?: string;
}

const SimSection: React.FC<SimSectionProps> = ({ title, total, onAddItem, children, cardClassName }) => {
  return (
    <Card
      className={`!p-3 ${cardClassName || ''}`}
      title={
        <div className="flex justify-between items-center w-full">
          <h4 className="text-md font-semibold text-clarissa-dark">{title}</h4>
          {typeof total === 'number' && (
            <span className="text-sm font-medium text-clarissa-primary">{formatCurrency(total)}</span>
          )}
        </div>
      }
      actions={onAddItem && (
        <Button variant="outline" size="sm" onClick={onAddItem} leftIcon={<PlusCircle size={14}/>} className="!py-1 !px-1.5 !text-xs">
          Adicionar
        </Button>
      )}
    >
      <div className="mt-2 text-xs">
        {children}
      </div>
    </Card>
  );
};


export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({
  leadId, navigateTo, leads, setLeads: setLeadsState, costSimulations, setCostSimulations: setSimulationsState,
  clients, setClients: setClientsState, projects, setProjects: setProjectsState, officeCostConfigs, teamMemberConfigs, teamMembers
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [currentSimulation, setCurrentSimulation] = useState<CostSimulation | null>(null);

  // Simulation form states
  const [projectDurationMonths, setProjectDurationMonths] = useState(1);
  const [simOfficeFixedCosts, setSimOfficeFixedCosts] = useState<CostItem[]>([]);
  const [simProjectVariableCosts, setSimProjectVariableCosts] = useState<CostItem[]>([]);
  const [simProjectStyle, setSimProjectStyle] = useState<string>(PROJECT_STYLE_OPTIONS[0]);
  const [simDetailedStages, setSimDetailedStages] = useState<ProjectStage[]>([]);
  const [simComplexityFactors, setSimComplexityFactors] = useState<ComplexityFactorItem[]>([]);
  const [simProfitMargin, setSimProfitMargin] = useState(25);
  const [simNegotiationMargin, setSimNegotiationMargin] = useState(0);
  const [simTaxPercentage, setSimTaxPercentage] = useState(6);
  const [simDiscountPercentage, setSimDiscountPercentage] = useState(0); 
  const [simulationTotals, setSimulationTotals] = useState<Partial<CostSimulation>>({}); 

  const [isLeadFormModalOpen, setIsLeadFormModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const fetchLeads = async () => setLeadsState(await dbService.getLeads());
  const fetchSimulations = async () => setSimulationsState(await dbService.getCostSimulations());
  const fetchClients = async () => setClientsState(await dbService.getClients());
  const fetchProjects = async () => setProjectsState(await dbService.getProjects());

  useEffect(() => {
    const foundLead = leads.find(l => l.id === leadId);
    if (foundLead) {
      setLead(foundLead);
      const sim = costSimulations.find(cs => cs.id === foundLead.costSimulationId);
      setCurrentSimulation(sim || null);

      const initialDuration = sim?.projectDurationMonths || 1;
      setProjectDurationMonths(initialDuration);

      setSimOfficeFixedCosts(
        sim?.simulatedOfficeFixedCosts ||
        getAppliedConfigItems(officeCostConfigs, [], (config, isApplied, qty) => ({
            id: `fixed-${config.id}-${Date.now()}`, configItemId: config.id, name: config.name, type: 'OFFICE_FIXED',
            unit: 'monthly', baseValue: config.monthlyBaseValue, quantity: qty,
            calculatedCost: config.monthlyBaseValue * qty,
            isDefault: true, editable: false, isApplied
        }), initialDuration)
      );
      setSimProjectVariableCosts(sim?.simulatedProjectVariableCosts || []);
      setSimProjectStyle(sim?.projectStyle || PROJECT_STYLE_OPTIONS[0]);
      setSimDetailedStages(sim?.detailedStages || JSON.parse(JSON.stringify(DEFAULT_PROJECT_DETAILED_STAGES_TEMPLATE)));
      setSimComplexityFactors(sim?.simulatedComplexityFactors || DEFAULT_COMPLEXITY_FACTORS_TEMPLATE.map(f => ({...f, id: `complex-${f.name.replace(/\s+/g, '-')}-${Date.now()}`})));
      setSimProfitMargin(sim?.profitMarginPercentage || 25);
      setSimNegotiationMargin(sim?.negotiationMarginPercentage || 0);
      setSimTaxPercentage(sim?.taxPercentage || 6);
      setSimDiscountPercentage(sim?.discountPercentage || 0);

    } else {
      // If lead not found in current state, try fetching from DB (might happen on direct navigation)
      const fetchLeadAndSim = async () => {
          const dbLeads = await dbService.getLeads();
          const dbLead = dbLeads.find(l => l.id === leadId);
          if (dbLead) {
              setLeadsState(dbLeads); // Update global state
              setLead(dbLead);
              const dbSims = await dbService.getCostSimulations();
              const dbSim = dbSims.find(cs => cs.id === dbLead.costSimulationId);
              setSimulationsState(dbSims); // Update global state
              setCurrentSimulation(dbSim || null);
              // Set form states based on dbLead and dbSim (similar to above)
          } else {
              navigateTo('/crm');
          }
      };
      fetchLeadAndSim();
    }
  }, [leadId, leads, costSimulations, officeCostConfigs, navigateTo, setLeadsState, setSimulationsState]);

  useEffect(() => {
    setSimOfficeFixedCosts(prev => prev.map(item => item.unit === 'monthly' ? {...item, quantity: projectDurationMonths, calculatedCost: item.baseValue * projectDurationMonths } : item));
  }, [projectDurationMonths]);

  const calculateTotals = useCallback(() => {
    let subtotalOfficeFixedRaw = 0;
    simOfficeFixedCosts.forEach(item => {
        if(item.isApplied) subtotalOfficeFixedRaw += item.calculatedCost;
    });
    const officeCostContribution = subtotalOfficeFixedRaw * 0.15;

    let subtotalVariable = 0;
    simProjectVariableCosts.forEach(item => {
        item.calculatedCost = item.baseValue * (item.quantity || 1);
        subtotalVariable += item.calculatedCost;
    });

    let subtotalFromDetailedStages = 0;
    simDetailedStages.forEach(stage => {
        stage.items.forEach(item => {
            const responsible = teamMembers.find(tm => tm.id === item.responsibleId);
            const hourlyRate = responsible?.hourlyRate || 0;
            subtotalFromDetailedStages += (item.hours || 0) * hourlyRate;
        });
    });

    const subtotalDirect = officeCostContribution + subtotalVariable + subtotalFromDetailedStages;

    let totalComplexityVal = 0;
    simComplexityFactors.forEach(factor => {
      if(factor.isApplied) totalComplexityVal += subtotalDirect * (factor.percentage / 100);
    });

    const costWithComplex = subtotalDirect + totalComplexityVal;
    const profitVal = costWithComplex * (simProfitMargin / 100);
    const costPlusProf = costWithComplex + profitVal;
    const negotiationVal = costPlusProf * (simNegotiationMargin / 100);
    const costPlusProfAndNego = costPlusProf + negotiationVal;

    const discountVal = costPlusProfAndNego * (simDiscountPercentage / 100);
    const finalValueBeforeTaxAfterDisc = costPlusProfAndNego - discountVal;

    const taxVal = finalValueBeforeTaxAfterDisc * (simTaxPercentage / 100);
    const finalProposedValWithDiscount = finalValueBeforeTaxAfterDisc + taxVal;

    setSimulationTotals({
        subtotalOfficeFixedCostsProRata: subtotalOfficeFixedRaw || 0,
        calculatedOfficeFixedCostsContribution: officeCostContribution || 0,
        subtotalProjectVariableCosts: subtotalVariable || 0,
        subtotalTeamCosts: subtotalFromDetailedStages || 0,
        subtotalDirectCosts: subtotalDirect || 0,
        totalComplexityValue: totalComplexityVal || 0,
        costWithComplexity: costWithComplex || 0,
        profitValue: profitVal || 0,
        costPlusProfit: costPlusProf || 0,
        negotiationValue: negotiationVal || 0,
        costPlusProfitAndNegotiation: costPlusProfAndNego || 0,
        discountValue: discountVal || 0,
        finalValueBeforeTaxAfterDiscount: finalValueBeforeTaxAfterDisc || 0,
        taxValue: taxVal || 0,
        finalProposedValue: finalProposedValWithDiscount || 0,
        finalProposedValueWithDiscount: finalProposedValWithDiscount || 0,
    });
  }, [simOfficeFixedCosts, simProjectVariableCosts, simDetailedStages, simComplexityFactors, projectDurationMonths, simProfitMargin, simNegotiationMargin, simTaxPercentage, simDiscountPercentage, teamMembers]);

  useEffect(() => { calculateTotals(); }, [calculateTotals]);

  const handleSaveSimulation = async () => {
    if (!lead) return;
    const simulationData: CostSimulation = {
      id: currentSimulation?.id || lead.costSimulationId || `sim-${Date.now()}`,
      leadId: lead.id,
      projectDurationMonths,
      simulatedOfficeFixedCosts: simOfficeFixedCosts,
      simulatedProjectVariableCosts: simProjectVariableCosts,
      simulatedTeamCosts: [], // Not used if detailedStages is primary source
      projectStyle: simProjectStyle,
      detailedStages: simDetailedStages,
      simulatedComplexityFactors: simComplexityFactors,
      profitMarginPercentage: simProfitMargin,
      negotiationMarginPercentage: simNegotiationMargin,
      taxPercentage: simTaxPercentage,
      discountPercentage: simDiscountPercentage,

      subtotalOfficeFixedCostsProRata: simulationTotals.subtotalOfficeFixedCostsProRata || 0,
      calculatedOfficeFixedCostsContribution: simulationTotals.calculatedOfficeFixedCostsContribution,
      subtotalProjectVariableCosts: simulationTotals.subtotalProjectVariableCosts || 0,
      subtotalTeamCosts: simulationTotals.subtotalTeamCosts || 0,
      subtotalDirectCosts: simulationTotals.subtotalDirectCosts || 0,
      totalComplexityValue: simulationTotals.totalComplexityValue || 0,
      costWithComplexity: simulationTotals.costWithComplexity || 0,
      profitValue: simulationTotals.profitValue || 0,
      costPlusProfit: simulationTotals.costPlusProfit || 0,
      negotiationValue: simulationTotals.negotiationValue || 0,
      costPlusProfitAndNegotiation: simulationTotals.costPlusProfitAndNegotiation || 0,
      discountValue: simulationTotals.discountValue,
      finalValueBeforeTaxAfterDiscount: simulationTotals.finalValueBeforeTaxAfterDiscount,
      taxValue: simulationTotals.taxValue || 0,
      finalProposedValue: simulationTotals.finalProposedValue || 0,
      finalProposedValueWithDiscount: simulationTotals.finalProposedValueWithDiscount,
      
      createdAt: currentSimulation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.addOrUpdateCostSimulation(simulationData);
    fetchSimulations(); // Refresh global simulations state
    
    const leadFinalValue = simulationData.finalProposedValueWithDiscount !== undefined ? simulationData.finalProposedValueWithDiscount : simulationData.finalProposedValue;
    const updatedLead = { ...lead, costSimulationId: simulationData.id, estimatedValue: leadFinalValue };
    await dbService.updateLead(updatedLead);
    fetchLeads(); // Refresh global leads state

    setCurrentSimulation(simulationData); // Update local state for current simulation
    setLead(updatedLead); // Update local state for current lead

    alert("Simulação salva!");
  };

  const handleSimOfficeItemChange = (itemId: string, field: keyof CostItem, value: any) => {
    setSimOfficeFixedCosts(prev => prev.map(item => item.id === itemId ? { ...item, [field]: value, calculatedCost: field === 'baseValue' ? parseFloat(value) * item.quantity : item.baseValue * (field === 'quantity' ? parseInt(value) : item.quantity) } : item));
  };
  const handleSimVariableItemChange = (itemId: string, field: keyof CostItem, value: any) => {
    setSimProjectVariableCosts(prev => prev.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };
  const handleToggleApplySimOfficeItem = (itemId: string) => {
    setSimOfficeFixedCosts(prev => prev.map(item => item.id === itemId ? { ...item, isApplied: !item.isApplied } : item));
  };
  const handleSimComplexityChange = (factorId: string, field: keyof ComplexityFactorItem, value: any) => {
    setSimComplexityFactors(prev => prev.map(f => f.id === factorId ? { ...f, [field]: value } : f));
  };
  const handleToggleApplySimComplexity = (factorId: string) => {
    setSimComplexityFactors(prev => prev.map(f => f.id === factorId ? { ...f, isApplied: !f.isApplied } : f));
  };
  const addCustomSimCostItem = () => {
    setSimProjectVariableCosts(prev => [...prev, {
        id: `custom-var-${Date.now()}`, name: 'Novo Custo Variável', type: 'PROJECT_VARIABLE',
        unit: 'unit', baseValue: 0, quantity: 1, calculatedCost: 0,
        isDefault: false, editable: true, isApplied: true,
    }]);
  };
  const removeCustomSimCostItem = (itemId: string) => {
    if(window.confirm("Remover este custo variável?")) setSimProjectVariableCosts(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveLeadDetails = async (updatedLeadData: Lead) => {
    await dbService.updateLead(updatedLeadData);
    fetchLeads();
    setLead(updatedLeadData); // Update local state for current lead
    setIsLeadFormModalOpen(false);
  };

  const handleClientModalSaveForConversion = async (clientData: Client) => {
    const existingClient = clients.find(c => c.id === clientData.id);
    if (existingClient) {
        await dbService.updateClient(clientData);
    } else {
        await dbService.addClient(clientData);
    }
    fetchClients();
    setIsClientModalOpen(false);
    if (lead) convertLeadToProject(lead, clientData); // Use the newly saved client data
  };

  const startLeadToProjectConversion = () => {
      if (!lead) return;
      const existingClient = clients.find(c =>
          c.name.toLowerCase() === lead.potentialClientName.toLowerCase() ||
          (lead.contactEmail && c.email && c.email.toLowerCase() === lead.contactEmail.toLowerCase())
      );
      if (existingClient) {
          if(window.confirm(`Cliente "${existingClient.name}" encontrado. Deseja usar este cliente? ('Cancelar' para criar novo)`)) convertLeadToProject(lead, existingClient);
          else setIsClientModalOpen(true);
      } else setIsClientModalOpen(true);
  };

  const convertLeadToProject = async (currentLead: Lead, client: Client) => {
      const finalValueForProject = simulationTotals.finalProposedValueWithDiscount !== undefined ? simulationTotals.finalProposedValueWithDiscount : (simulationTotals.finalProposedValue || currentLead.estimatedValue || 0);
      const newProject: Project = {
          id: `proj-${Date.now()}`, client_id: client.id, clientName: client.name,
          name: currentLead.projectDescription.substring(0, 50) || `Projeto ${client.name}`,
          type: ProjectType.RESIDENTIAL, address: client.address || 'A definir',
          start_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + (projectDurationMonths || 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: ProjectStatus.PLANNING,
          notes: `Convertido da Oportunidade CRM: ${currentLead.potentialClientName} - ${currentLead.projectDescription}\n\n${currentLead.notes || ''}`,
          totalValue: finalValueForProject,
          paidValue: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          phases: [], files: [], tasks: [], payments: [], contracts: [], appointments: [],
          projectStyle: simProjectStyle, detailedStages: simDetailedStages
      };
      await dbService.addProject(newProject);
      await dbService.updateLead({...currentLead, status: LeadStatus.WON});
      fetchProjects();
      fetchLeads();
      alert(`Oportunidade convertida para projeto "${newProject.name}"!`);
      navigateTo(`/projects/${newProject.id}`);
  };

  const handleArchiveLead = async () => {
    if (!lead || !window.confirm("Arquivar esta oportunidade?")) return;
    await dbService.updateLead({...lead, status: LeadStatus.ARCHIVED});
    fetchLeads();
    navigateTo('/crm');
  };
  const handleDeleteLead = async () => {
    if (!lead || !window.confirm("Excluir permanentemente esta oportunidade? Esta ação não pode ser desfeita.")) return;
    await dbService.deleteLead(lead.id); // Also deletes simulation
    fetchLeads();
    fetchSimulations();
    navigateTo('/crm');
  };

  const TABS = [
    { id: 'details', label: 'Detalhes da Oportunidade', icon: <Info size={16} /> },
    { id: 'simulation', label: 'Simulação de Custos', icon: <BarChart3 size={16} /> },
  ];

  const responsibleUser = useMemo(() => teamMembers.find(tm => tm.id === lead?.responsibleUserId), [teamMembers, lead]);

  if (!lead) return <div className="p-4 text-center">Carregando oportunidade...</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigateTo('/crm')} leftIcon={<ArrowLeft size={20} />} className="text-clarissa-primary">
        Voltar para Oportunidades
      </Button>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-clarissa-dark">{lead.potentialClientName}</h1>
                <p className="text-md md:text-lg text-clarissa-secondary mt-1">{lead.projectDescription}</p>
            </div>
            <div className="flex flex-col items-end gap-2 md:min-w-[200px]">
                 <Badge text={lead.status} className="text-sm px-3 py-1"/>
                 <div className="flex space-x-2 mt-2 md:mt-0">
                    <Button size="sm" variant="outline" onClick={() => setIsLeadFormModalOpen(true)} leftIcon={<Edit3 size={15}/>}>Editar</Button>
                    <Button size="sm" variant="primary" onClick={startLeadToProjectConversion} leftIcon={<CheckSquareIcon size={15}/>} disabled={lead.status === LeadStatus.WON || lead.status === LeadStatus.ARCHIVED}>Converter</Button>
                 </div>
            </div>
        </div>
      </Card>

      <Tabs tabs={TABS} defaultTabId={activeTab} onTabChange={setActiveTab}>
        {(activeTabId) => (
          <div>
            {activeTabId === 'details' && (
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div><strong className="text-clarissa-secondary block">Email:</strong> {lead.contactEmail || 'N/A'}</div>
                  <div><strong className="text-clarissa-secondary block">Telefone:</strong> {lead.contactPhone || 'N/A'}</div>
                  <div><strong className="text-clarissa-secondary block">Fonte:</strong> {lead.source || 'N/A'}</div>
                  <div><strong className="text-clarissa-secondary block">Valor Estimado (Simulação):</strong> {formatCurrency(lead.estimatedValue)}</div>
                  <div><strong className="text-clarissa-secondary block">Próxima Ação:</strong> {formatDate(lead.nextActionDate)}</div>
                  <div><strong className="text-clarissa-secondary block">Responsável:</strong> {responsibleUser?.name || 'Não atribuído'}</div>
                  <div className="md:col-span-2"><strong className="text-clarissa-secondary block">Observações:</strong> <pre className="font-sans whitespace-pre-wrap">{lead.notes || 'Nenhuma observação.'}</pre></div>
                  <div className="md:col-span-2 pt-4 border-t border-clarissa-lightgray flex justify-end space-x-2">
                    {lead.status !== LeadStatus.ARCHIVED && lead.status !== LeadStatus.WON && <Button variant="outline" size="sm" onClick={handleArchiveLead} leftIcon={<Archive size={15}/>}>Arquivar</Button> }
                    <Button variant="danger"  size="sm" onClick={handleDeleteLead} leftIcon={<Trash2 size={15}/>}>Excluir</Button>
                  </div>
                </div>
              </Card>
            )}
            {activeTabId === 'simulation' && (
              <div className="space-y-4">
                 <div className="flex items-center justify-end space-x-3 mb-4 sticky top-0 bg-clarissa-background py-3 z-10 border-b border-clarissa-lightgray -mx-1 px-1">
                     <Button onClick={handleSaveSimulation} variant="primary" leftIcon={<Save size={16}/>}>Salvar Simulação</Button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSimulation();}} className="space-y-3 text-sm">
                    <Input label="Duração Estimada do Projeto (meses)" type="number" value={projectDurationMonths} onChange={e => setProjectDurationMonths(Math.max(1, parseInt(e.target.value)) || 1)} required min="1"/>

                    <SimSection title="Custos Fixos do Escritório (Pro-Rata)" total={simulationTotals.subtotalOfficeFixedCostsProRata || 0}>
                         {simOfficeFixedCosts.map(item => (
                            <div key={item.id} className={`grid grid-cols-12 gap-2 items-center py-1.5 border-b border-clarissa-lightgray/30 text-xs sm:text-sm ${!item.isApplied ? 'opacity-50' : ''}`}>
                                <div className="col-span-1 flex items-center"> <button type="button" onClick={() => handleToggleApplySimOfficeItem(item.id)} className="p-0.5">{item.isApplied ? <CheckSquareIcon size={16} className="text-clarissa-primary"/> : <XSquare size={16} className="text-clarissa-secondary"/>}</button> </div>
                                <div className="col-span-11 sm:col-span-4 truncate" title={item.name}>{item.name}</div>
                                <div className="hidden sm:block sm:col-span-2">R$ {item.baseValue.toFixed(2)}</div>
                                <div className="hidden sm:block sm:col-span-2"><Input type="number" value={item.quantity} className="py-1 px-1.5 text-xs h-7 bg-clarissa-lightgray/30" readOnly /></div>
                                <div className="col-span-11 sm:col-span-2 text-right pr-1">R$ {item.calculatedCost.toFixed(2)}</div>
                                <div className="hidden sm:block sm:col-span-1"></div>
                            </div>
                        ))}
                         <div className="text-right font-semibold mt-1.5 pt-1.5 border-t-2 border-clarissa-secondary/40 pr-1 text-clarissa-dark text-sm">
                            Contribuição para Simulação (15%): <span className="text-clarissa-primary">{formatCurrency(simulationTotals.calculatedOfficeFixedCostsContribution)}</span>
                         </div>
                    </SimSection>

                    <SimSection title="Custos Variáveis Específicos do Projeto" onAddItem={addCustomSimCostItem} total={simulationTotals.subtotalProjectVariableCosts || 0}>
                        {simProjectVariableCosts.map(item => (
                            <div key={item.id} className={`grid grid-cols-12 gap-2 items-center py-1.5 border-b border-clarissa-lightgray/30 text-xs sm:text-sm`}>
                                <div className="col-span-11 sm:col-span-4"><Input value={item.name} onChange={(e) => handleSimVariableItemChange(item.id, 'name', e.target.value)} className="py-1 px-1.5 text-xs h-7" readOnly={!item.editable} title={item.name}/></div>
                                <div className="col-span-5 sm:col-span-2"><Input type="number" value={item.baseValue} onChange={(e) => handleSimVariableItemChange(item.id, 'baseValue', parseFloat(e.target.value))} className="py-1 px-1.5 text-xs h-7" step="0.01" readOnly={!item.editable}/></div>
                                <div className="col-span-4 sm:col-span-2"><Input type="number" value={item.quantity} onChange={(e) => handleSimVariableItemChange(item.id, 'quantity', parseInt(e.target.value))} className="py-1 px-1.5 text-xs h-7" step="1" /></div>
                                <div className="col-span-3 sm:col-span-2 text-right pr-1 font-medium">R$ {(item.baseValue * (item.quantity || 0)).toFixed(2)}</div>
                                <div className="col-span-12 sm:col-span-2 flex justify-end"> {item.editable && <Button type="button" variant="ghost" size="sm" onClick={() => removeCustomSimCostItem(item.id)} className="p-1 text-clarissa-danger"><Trash2 size={14}/></Button>}</div>
                            </div>
                        ))}
                    </SimSection>

                    <SimSection title="Precificação Detalhada por Etapas (Custos da Equipe)" total={simulationTotals.subtotalTeamCosts || 0}>
                        <DetailedStagesPricingForm
                            stages={simDetailedStages}
                            setStages={(newStages) => {
                                setSimDetailedStages(newStages);
                            }}
                            teamMembers={teamMembers}
                            projectStyle={simProjectStyle}
                            onProjectStyleChange={setSimProjectStyle}
                            isReadOnly={false}
                            isCompact={true}
                        />
                    </SimSection>

                    <SimSection title="Fatores de Complexidade Aplicados (sobre Custo Direto Total)" total={simulationTotals.totalComplexityValue || 0}>
                        {simComplexityFactors.map(factor => (
                            <div key={factor.id} className={`grid grid-cols-12 gap-2 items-center py-1.5 border-b border-clarissa-lightgray/30 text-xs sm:text-sm ${!factor.isApplied ? 'opacity-50' : ''}`}>
                                <div className="col-span-1 flex items-center"> <button type="button" onClick={() => handleToggleApplySimComplexity(factor.id)} className="p-0.5">{factor.isApplied ? <CheckSquareIcon size={16} className="text-clarissa-primary"/> : <XSquare size={16} className="text-clarissa-secondary"/>}</button> </div>
                                <div className="col-span-7 sm:col-span-8 truncate" title={factor.name}>{factor.name}</div>
                                <div className="col-span-4 sm:col-span-3"><Input type="number" value={factor.percentage} onChange={(e) => handleSimComplexityChange(factor.id, 'percentage', parseFloat(e.target.value))} suffix="%" className="py-1 px-1.5 text-xs h-7" disabled={!factor.isApplied}/></div>
                            </div>
                        ))}
                    </SimSection>

                    <SimSection title="Configurações da Proposta">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                            <Input label="% Margem de Lucro" type="number" value={simProfitMargin} onChange={e => setSimProfitMargin(parseFloat(e.target.value))} suffix="%" required min="0"/>
                            <Input label="% Margem de Negociação" type="number" value={simNegotiationMargin} onChange={e => setSimNegotiationMargin(parseFloat(e.target.value))} suffix="%" required min="0"/>
                            <Input label="% Desconto Aplicado" type="number" value={simDiscountPercentage} onChange={e => setSimDiscountPercentage(parseFloat(e.target.value))} suffix="%" required min="0"/>
                            <Input label="% Impostos" type="number" value={simTaxPercentage} onChange={e => setSimTaxPercentage(parseFloat(e.target.value))} suffix="%" required min="0"/>
                        </div>
                    </SimSection>

                    <SimSection title="Resumo da Proposta" cardClassName="bg-clarissa-primary/5">
                        <div className="space-y-1.5 text-sm p-2 rounded-md">
                            <SummaryRow label="Custos Fixos (contribuição)" value={simulationTotals.calculatedOfficeFixedCostsContribution} />
                            <SummaryRow label="Custos Variáveis" value={simulationTotals.subtotalProjectVariableCosts} />
                            <SummaryRow label="Custos Equipe (Precificação por Etapas)" value={simulationTotals.subtotalTeamCosts} />
                            <SummaryRow label="Subtotal Custos Diretos" value={simulationTotals.subtotalDirectCosts} bold />
                            <SummaryRow label="Valor Adicional Complexidade" value={simulationTotals.totalComplexityValue} />
                            <SummaryRow label="Custo Total com Complexidade" value={simulationTotals.costWithComplexity} bold />
                            <SummaryRow label="Valor Lucro" value={simulationTotals.profitValue} />
                            <SummaryRow label="Custo + Lucro" value={simulationTotals.costPlusProfit} bold />
                            <SummaryRow label="Valor Negociação" value={simulationTotals.negotiationValue} />
                            <SummaryRow label="Custo + Lucro + Negociação" value={simulationTotals.costPlusProfitAndNegotiation} bold className="text-clarissa-dark" />
                            <SummaryRow label="Valor Desconto Aplicado" value={simulationTotals.discountValue} isNegative />
                            <SummaryRow label="Valor Final Antes de Impostos (com Desconto)" value={simulationTotals.finalValueBeforeTaxAfterDiscount} bold />
                            <SummaryRow label="Valor Impostos" value={simulationTotals.taxValue} />
                            <div className="border-t border-clarissa-primary/30 my-2"></div>
                            <SummaryRow label="VALOR FINAL PROPOSTO (COM DESCONTO)" value={simulationTotals.finalProposedValueWithDiscount} bold isTotal className="text-xl text-clarissa-primary" />
                        </div>
                    </SimSection>
                </form>
              </div>
            )}
          </div>
        )}
      </Tabs>

      {isLeadFormModalOpen && lead && (
        <LeadFormModal
          isOpen={isLeadFormModalOpen}
          onClose={() => setIsLeadFormModalOpen(false)}
          onSave={handleSaveLeadDetails}
          leadToEdit={lead}
          teamMembers={teamMembers}
        />
      )}
      {isClientModalOpen && lead && (
          <ClientFormModal
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            onSave={handleClientModalSaveForConversion}
            clientToEdit={{
                id: `client-${Date.now()}`, name: lead.potentialClientName, email: lead.contactEmail || '',
                phone: lead.contactPhone || '', cpf_cnpj: '', address: '',
                notes: `Cliente de Oportunidade: ${lead.projectDescription}`,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            } as Client}
          />
      )}
    </div>
  );
};

const SummaryRow: React.FC<{label: string; value?: number; bold?: boolean; isTotal?: boolean; isNegative?: boolean; className?: string}> = ({label, value, bold, isTotal, isNegative, className}) => (
    <div className={`flex justify-between items-center py-0.5 ${isTotal ? 'mt-1' : ''} ${className || ''}`}>
        <span className={`${bold || isTotal ? 'font-semibold' : ''} ${isTotal ? 'text-clarissa-primary' : 'text-clarissa-secondary'}`}>{label}:</span>
        <span className={`${bold || isTotal ? 'font-bold' : 'font-medium'} ${isTotal ? 'text-clarissa-primary' : 'text-clarissa-dark'}`}>
            {isNegative && value !== undefined && value > 0 ? "- " : ""}
            {formatCurrency(value)}
        </span>
    </div>
);
