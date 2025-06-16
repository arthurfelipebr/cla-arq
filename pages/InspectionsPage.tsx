import React from 'react';
import { Card } from '../components/common/Card';
import { Inspection, Client } from '../types';
import { Dispatch, SetStateAction } from 'react';

interface InspectionsPageProps {
  inspections: Inspection[];
  setInspections: Dispatch<SetStateAction<Inspection[]>>;
  clients: Client[];
}

export const InspectionsPage: React.FC<InspectionsPageProps> = ({ inspections, setInspections, clients }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-clarissa-dark mb-6">Inspeções</h1>
      <Card title="Lista de Inspeções">
        <p className="text-clarissa-secondary">Conteúdo da página de inspeções aparecerá aqui.</p>
        {/* TODO: Implement inspection listing, filtering, and file uploads */}
      </Card>
    </div>
  );
};