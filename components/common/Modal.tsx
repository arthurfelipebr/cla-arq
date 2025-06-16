
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'screen'; // Added 'screen' size
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    screen: 'w-[95vw] max-w-7xl h-[90vh]', // Classes for near full-screen modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-hidden">
      <div 
        className={`bg-clarissa-background rounded-xl shadow-float flex flex-col
                    ${sizeClasses[size]} 
                    transform transition-all ${size === 'screen' ? 'p-0' : 'p-6'}`}
      >
        <div className={`flex items-center justify-between ${size === 'screen' ? 'p-4 border-b border-clarissa-lightgray' : 'mb-4'}`}>
          <h2 className="text-xl font-semibold text-clarissa-dark truncate pr-2" title={title}>{title}</h2>
          <button
            onClick={onClose}
            className="text-clarissa-secondary hover:text-clarissa-dark transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div 
            className={`clarissa-scrollbar overflow-y-auto ${size === 'screen' ? 'flex-grow p-4 pr-3' : 'max-h-[70vh] pr-2'}`}
        >
            {children}
        </div>
      </div>
    </div>
  );
};