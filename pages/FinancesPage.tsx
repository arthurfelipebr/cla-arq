import React from 'react';
import { Card } from '../components/common/Card';
import { Payment, Project } from '../types';

interface FinancesPageProps {
  payments: Payment[];
  projects: Project[];
}

export const FinancesPage: React.FC<FinancesPageProps> = ({ payments, projects }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-clarissa-dark mb-6">Financeiro</h1>
      <Card title="Visão Geral Financeira">
        <p className="text-clarissa-secondary">Conteúdo da página financeira aparecerá aqui.</p>
        {/* TODO: Implement financial overview, transaction listing, and export functionalities */}
      </Card>
    </div>
  );
};