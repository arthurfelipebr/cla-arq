
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { Client } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, clientToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setEmail(clientToEdit.email);
      setPhone(clientToEdit.phone);
      setCpfCnpj(clientToEdit.cpf_cnpj);
      setAddress(clientToEdit.address);
      setNotes(clientToEdit.notes || '');
    } else {
      // Reset form for new client
      setName('');
      setEmail('');
      setPhone('');
      setCpfCnpj('');
      setAddress('');
      setNotes('');
    }
  }, [clientToEdit, isOpen]); // Rerun effect when isOpen changes to reset form for new

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const clientData: Client = {
      id: clientToEdit?.id || `client-${Date.now()}`,
      name,
      email,
      phone,
      cpf_cnpj: cpfCnpj,
      address,
      notes,
      createdAt: clientToEdit?.createdAt || now,
      updatedAt: now,
    };
    onSave(clientData);
    onClose(); // Close modal after save
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={clientToEdit ? "Editar Cliente" : "Adicionar Novo Cliente"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Nome Completo / Razão Social" 
          name="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="E-mail" 
            name="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input 
            label="Telefone" 
            name="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
          />
        </div>
        <Input 
          label="CPF / CNPJ" 
          name="cpfCnpj" 
          value={cpfCnpj} 
          onChange={(e) => setCpfCnpj(e.target.value)} 
          required 
        />
        <Input 
          label="Endereço" 
          name="address" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          required 
        />
        <Textarea 
          label="Observações" 
          name="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows={3}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{clientToEdit ? "Salvar Alterações" : "Adicionar Cliente"}</Button>
        </div>
      </form>
    </Modal>
  );
};
