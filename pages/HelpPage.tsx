import React from 'react';
import { Card } from '../components/common/Card';

export const HelpPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-clarissa-dark mb-6">Ajuda & Suporte</h1>
      <Card title="Perguntas Frequentes">
        <p className="text-clarissa-secondary">Conteúdo da página de ajuda aparecerá aqui.</p>
        {/* TODO: Implement FAQ, contact information, or documentation links */}
      </Card>
    </div>
  );
};