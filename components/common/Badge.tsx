
import React from 'react';
import { STATUS_COLORS } from '../../constants';

interface BadgeProps {
  text: string;
  className?: string;
  colorClass?: string; // Allow overriding default status colors if needed
}

export const Badge: React.FC<BadgeProps> = ({ text, className = '', colorClass }) => {
  const badgeColorClass = colorClass || STATUS_COLORS[text] || 'bg-gray-100 text-gray-700';
  
  return (
    <span
      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColorClass} ${className}`}
    >
      {text}
    </span>
  );
};
