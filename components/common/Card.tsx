
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode; // Changed from string to React.ReactNode
  actions?: React.ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLDivElement>) => void; // Updated onClick prop type
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, actions, onClick }) => {
  const cardClasses = `bg-white shadow-subtle hover:shadow-medium transition-shadow duration-300 rounded-xl p-4 md:p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            typeof title === 'string' ? (
              <h3 className="text-lg font-semibold text-clarissa-dark flex-grow">{title}</h3>
            ) : (
              // If title is a ReactNode, render it within a div that can grow.
              // The ReactNode itself should handle its styling.
              <div className="flex-grow">{title}</div>
            )
          )}
          {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
