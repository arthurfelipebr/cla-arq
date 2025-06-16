

import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select'; // Added import
import { User, OfficeCostConfigItem, TeamMemberConfigItem } from '../types';
import { PlusCircle, Edit3, Trash2, Save, Users2, Building } from 'lucide-react';
import * as dbService from '../services/databaseService';

interface SettingsPageProps {
  user: User;
  officeCostConfigs: OfficeCostConfigItem[]; // From App state (DB sourced)
  setOfficeCostConfigsState: React.Dispatch<React.SetStateAction<OfficeCostConfigItem[]>>; // To update App's local copy
  teamMemberConfigs: TeamMemberConfigItem[]; // From App state (DB sourced)
  setTeamMemberConfigsState: React.Dispatch<React.SetStateAction<TeamMemberConfigItem[]>>; // To update App's local copy
  teamMembers: User[]; // From App state (DB sourced)
  setTeamMembersState: React.Dispatch<React.SetStateAction<User[]>>; // To update App's local copy
}

// Office Cost Config Form
const OfficeCostConfigForm: React.FC<{
  itemToEdit?: OfficeCostConfigItem | null;
  onSave: (item: OfficeCostConfigItem) => void;
  onClose: () => void;
}> = ({ itemToEdit, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [monthlyBaseValue, setMonthlyBaseValue] = useState<number | ''>('');

  useEffect(() => {
    setName(itemToEdit?.name || '');
    setMonthlyBaseValue(itemToEdit?.monthlyBaseValue || '');
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthlyBaseValue === '') return;
    onSave({
      id: itemToEdit?.id || `officecost-${Date.now()}`,
      name,
      monthlyBaseValue: Number(monthlyBaseValue),
      isArchived: itemToEdit?.isArchived || false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome do Custo Fixo" value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Valor Base Mensal (R$)" type="number" step="0.01" value={monthlyBaseValue} onChange={e => setMonthlyBaseValue(e.target.value === '' ? '' : parseFloat(e.target.value))} required />
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" leftIcon={<Save size={16}/>}>{itemToEdit ? "Salvar" : "Adicionar"}</Button>
      </div>
    </form>
  );
};

// Team Member Config Form
const TeamMemberConfigForm: React.FC<{
  itemToEdit?: TeamMemberConfigItem | null;
  onSave: (item: TeamMemberConfigItem) => void;
  onClose: () => void;
  teamUsers: User[]; // Pass full user list for selection or matching
}> = ({ itemToEdit, onSave, onClose, teamUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(itemToEdit?.id || '');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');

  useEffect(() => {
    if (itemToEdit) {
      setSelectedUserId(itemToEdit.id);
      setName(itemToEdit.name);
      setRole(itemToEdit.role);
      setHourlyRate(itemToEdit.hourlyRate);
    } else {
      setSelectedUserId('');
      setName('');
      setRole('');
      setHourlyRate('');
    }
  }, [itemToEdit]);
  
  // Update name, role, rate if an existing user is selected
  useEffect(() => {
    if (selectedUserId && !itemToEdit) { // Only prefill for new items based on selection
        const selectedUser = teamUsers.find(u => u.id === selectedUserId);
        if (selectedUser) {
            setName(selectedUser.name);
            setRole(selectedUser.role || '');
            setHourlyRate(selectedUser.hourlyRate || '');
        }
    }
  }, [selectedUserId, itemToEdit, teamUsers]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hourlyRate === '' || !name) return;
    onSave({
      id: selectedUserId || itemToEdit?.id || `teamcfg-${Date.now()}`,
      name,
      role,
      hourlyRate: Number(hourlyRate),
      isArchived: itemToEdit?.isArchived || false,
    });
  };

  const userOptions = [{value: '', label: 'Novo Membro/Função Avulsa'}, ...teamUsers.map(u => ({value: u.id, label: u.name}))];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select 
        label="Membro da Equipe (Opcional)"
        options={userOptions}
        value={selectedUserId}
        onChange={e => setSelectedUserId(e.target.value)}
        // disabled={!!itemToEdit} // Disable if editing to prevent changing ID link
      />
      <Input label="Nome (se novo ou para sobrescrever)" value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Função/Cargo" value={role} onChange={e => setRole(e.target.value)} required />
      <Input label="Custo/Hora (R$)" type="number" step="0.01" value={hourlyRate} onChange={e => setHourlyRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required />
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" leftIcon={<Save size={16}/>}>{itemToEdit ? "Salvar" : "Adicionar"}</Button>
      </div>
    </form>
  );
};


export const SettingsPage: React.FC<SettingsPageProps> = ({ 
    user, 
    officeCostConfigs, setOfficeCostConfigsState, 
    teamMemberConfigs, setTeamMemberConfigsState,
    teamMembers, setTeamMembersState
}) => {
  const [isOfficeCostModalOpen, setIsOfficeCostModalOpen] = useState(false);
  const [officeCostToEdit, setOfficeCostToEdit] = useState<OfficeCostConfigItem | null>(null);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [teamMemberToEdit, setTeamMemberToEdit] = useState<TeamMemberConfigItem | null>(null);

  const fetchOfficeConfigs = async () => setOfficeCostConfigsState(await dbService.getOfficeCostConfigs());
  const fetchTeamMemberConfigs = async () => setTeamMemberConfigsState(await dbService.getTeamMemberConfigs());
  const fetchTeamUsers = async () => setTeamMembersState(await dbService.getTeamUsers());


  // Office Costs CRUD
  const handleSaveOfficeCost = async (item: OfficeCostConfigItem) => {
    await dbService.addOrUpdateOfficeCostConfig(item);
    fetchOfficeConfigs();
    setIsOfficeCostModalOpen(false);
  };
  const handleDeleteOfficeCost = async (itemId: string) => {
    if (window.confirm("Remover este custo fixo da configuração? (Será arquivado)")) {
      await dbService.deleteOfficeCostConfig(itemId); // This archives it
      fetchOfficeConfigs();
    }
  };

  // Team Members CRUD
  const handleSaveTeamMember = async (item: TeamMemberConfigItem) => {
    await dbService.addOrUpdateTeamMemberConfig(item);
    fetchTeamMemberConfigs();
    
    // If the saved config item corresponds to a User, update that User too.
    const userToUpdate = teamMembers.find(u => u.id === item.id);
    if(userToUpdate){
        await dbService.addOrUpdateTeamUser({
            ...userToUpdate,
            name: item.name,
            role: item.role,
            hourlyRate: item.hourlyRate
        });
        fetchTeamUsers(); // Refresh the list of team users
    }
    setIsTeamMemberModalOpen(false);
  };
  const handleDeleteTeamMember = async (itemId: string) => {
     if (window.confirm("Remover este membro/função da configuração de custos? (Será arquivado)")) {
      await dbService.deleteTeamMemberConfig(itemId); // This archives it
      fetchTeamMemberConfigs();
    }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-clarissa-dark">Configurações</h1>

      <Card title="Perfil do Usuário" className="bg-white">
        <div className="flex items-center space-x-4">
          <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=CB956F&color=fff`} alt="Avatar" className="w-16 h-16 rounded-full" />
          <div>
            <p className="text-xl font-semibold text-clarissa-dark">{user.name}</p>
            <p className="text-clarissa-secondary">{user.email}</p>
            {user.role && <p className="text-sm text-clarissa-secondary">{user.role}</p>}
          </div>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => alert("Edição de perfil em desenvolvimento.")}>Editar Perfil</Button>
      </Card>

      <Card title="Custos Fixos Mensais do Escritório" className="bg-white" actions={
        <Button onClick={() => { setOfficeCostToEdit(null); setIsOfficeCostModalOpen(true); }} leftIcon={<PlusCircle size={16}/>}>Adicionar Custo</Button>
      }>
        <div className="overflow-x-auto clarissa-scrollbar">
          <table className="min-w-full divide-y divide-clarissa-lightgray">
            <thead className="bg-clarissa-background/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-clarissa-secondary uppercase tracking-wider">Nome do Custo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-clarissa-secondary uppercase tracking-wider">Valor Mensal (R$)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-clarissa-secondary uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-clarissa-lightgray/50">
              {officeCostConfigs.map(item => ( // No longer filtering by isArchived here, DB query handles it
                <tr key={item.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-clarissa-dark">{item.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-clarissa-text">R$ {item.monthlyBaseValue.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setOfficeCostToEdit(item); setIsOfficeCostModalOpen(true);}} className="p-1"><Edit3 size={16}/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteOfficeCost(item.id)} className="p-1 text-clarissa-danger"><Trash2 size={16}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {officeCostConfigs.length === 0 && <p className="text-center py-4 text-clarissa-secondary">Nenhum custo fixo configurado.</p>}
      </Card>

      <Card title="Equipe e Custos/Hora" className="bg-white" actions={
        <Button onClick={() => { setTeamMemberToEdit(null); setIsTeamMemberModalOpen(true); }} leftIcon={<PlusCircle size={16}/>}>Adicionar Membro/Função</Button>
      }>
         <div className="overflow-x-auto clarissa-scrollbar">
          <table className="min-w-full divide-y divide-clarissa-lightgray">
            <thead className="bg-clarissa-background/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-clarissa-secondary uppercase tracking-wider">Nome / Função</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-clarissa-secondary uppercase tracking-wider">Custo/Hora (R$)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-clarissa-secondary uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-clarissa-lightgray/50">
              {teamMemberConfigs.map(item => ( // No longer filtering by isArchived here
                <tr key={item.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className="font-medium text-clarissa-dark">{item.name}</span>
                    <br />
                    <span className="text-clarissa-secondary text-xs">{item.role}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-clarissa-text">R$ {item.hourlyRate.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setTeamMemberToEdit(item); setIsTeamMemberModalOpen(true);}} className="p-1"><Edit3 size={16}/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTeamMember(item.id)} className="p-1 text-clarissa-danger"><Trash2 size={16}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {teamMemberConfigs.length === 0 && <p className="text-center py-4 text-clarissa-secondary">Nenhum membro/função configurado.</p>}
      </Card>

      <Modal isOpen={isOfficeCostModalOpen} onClose={() => setIsOfficeCostModalOpen(false)} title={officeCostToEdit ? "Editar Custo Fixo" : "Adicionar Custo Fixo"} size="md">
        <OfficeCostConfigForm itemToEdit={officeCostToEdit} onSave={handleSaveOfficeCost} onClose={() => setIsOfficeCostModalOpen(false)} />
      </Modal>

      <Modal isOpen={isTeamMemberModalOpen} onClose={() => setIsTeamMemberModalOpen(false)} title={teamMemberToEdit ? "Editar Membro/Função" : "Adicionar Membro/Função"} size="md">
        <TeamMemberConfigForm 
            itemToEdit={teamMemberToEdit} 
            onSave={handleSaveTeamMember} 
            onClose={() => setIsTeamMemberModalOpen(false)}
            teamUsers={teamMembers}
        />
      </Modal>

      <Card title="Outras Configurações" className="bg-white">
        <p className="text-clarissa-secondary">Outras preferências da aplicação (ex: tema, notificações) aparecerão aqui.</p>
      </Card>
    </div>
  );
};
