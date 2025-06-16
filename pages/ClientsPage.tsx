
import React, { useState, useMemo, useEffect } from 'react';
import { Client } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { PlusCircle, Edit3, Trash2, Search, User, Mail, Phone, MapPin } from 'lucide-react';
import * as dbService from '../services/databaseService';

interface ClientsPageProps {
  clients: Client[]; // Received from App state, which is sourced from DB
  setClientsState: React.Dispatch<React.SetStateAction<Client[]>>; // To update App's local copy after DB ops
}

const ClientListItem: React.FC<{ client: Client; onEdit: (client: Client) => void; onDelete: (clientId: string) => void; }> = ({ client, onEdit, onDelete }) => {
  return (
    <Card className="mb-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
        <div>
          <h3 className="text-xl font-semibold text-clarissa-primary">{client.name}</h3>
          <p className="text-sm text-clarissa-secondary flex items-center mt-1"><Mail size={14} className="mr-2 opacity-70"/>{client.email}</p>
          <p className="text-sm text-clarissa-secondary flex items-center"><Phone size={14} className="mr-2 opacity-70"/>{client.phone}</p>
          <p className="text-sm text-clarissa-secondary flex items-center"><MapPin size={14} className="mr-2 opacity-70"/>{client.address}</p>
          {client.cpf_cnpj && <p className="text-xs text-clarissa-secondary mt-1">CPF/CNPJ: {client.cpf_cnpj}</p>}
        </div>
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => onEdit(client)} leftIcon={<Edit3 size={16}/>}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(client.id)} leftIcon={<Trash2 size={16}/>}>Excluir</Button>
        </div>
      </div>
      {client.notes && <p className="text-sm text-clarissa-text mt-3 pt-3 border-t border-clarissa-lightgray/50 whitespace-pre-wrap">{client.notes}</p>}
    </Card>
  );
};


export const ClientsPage: React.FC<ClientsPageProps> = ({ clients, setClientsState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    const dbClients = await dbService.getClients();
    setClientsState(dbClients);
  };

  // Initial fetch is handled by App component. This could be used for targeted refresh if needed.
  // useEffect(() => {
  //   fetchClients();
  // }, []);


  const handleAddNewClient = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e pode afetar projetos vinculados.")) {
      await dbService.deleteClient(clientId);
      fetchClients(); // Re-fetch to update list
    }
  };

  const handleSaveClient = async (clientData: Client) => {
    if (clientToEdit) {
      await dbService.updateClient(clientData);
    } else {
      await dbService.addClient(clientData);
    }
    fetchClients(); // Re-fetch to update list
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.cpf_cnpj && client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-clarissa-dark">Clientes</h1>
        <Button onClick={handleAddNewClient} leftIcon={<PlusCircle size={20} />} variant="primary">
          Novo Cliente
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Buscar por nome, e-mail, CPF/CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
          className="mb-6"
        />
      </Card>

      {filteredClients.length > 0 ? (
        <div>
          {filteredClients.map(client => (
            <ClientListItem 
              key={client.id} 
              client={client} 
              onEdit={handleEditClient} 
              onDelete={handleDeleteClient} 
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-10">
          <User size={48} className="mx-auto text-clarissa-secondary mb-4" />
          <p className="text-xl text-clarissa-dark font-semibold">Nenhum cliente encontrado</p>
          <p className="text-clarissa-secondary">
            {searchTerm ? "Tente um termo de busca diferente ou " : ""}
            <Button variant="link" onClick={handleAddNewClient} className="p-0 h-auto text-base">adicione um novo cliente</Button>.
          </p>
        </Card>
      )}

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setClientToEdit(null); }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />
    </div>
  );
};
