
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: string; // Added suffix prop
}

export const Input: React.FC<InputProps> = ({ label, name, error, icon, suffix, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-clarissa-dark mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-gray-400' })}
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`block w-full px-3 py-2 border ${error ? 'border-clarissa-danger' : 'border-clarissa-secondary/50'} 
                     rounded-lg shadow-sm placeholder-gray-400 
                     focus:outline-none focus:ring-1 ${error ? 'focus:ring-clarissa-danger focus:border-clarissa-danger' : 'focus:ring-clarissa-primary focus:border-clarissa-primary'} 
                     sm:text-sm bg-white text-clarissa-dark
                     ${icon ? 'pl-10' : ''} 
                     ${suffix ? 'pr-8' : ''} ${className}`} // Adjusted padding for suffix
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-clarissa-secondary sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-clarissa-danger">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, name, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-clarissa-dark mb-1">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={3}
        className={`block w-full px-3 py-2 border ${error ? 'border-clarissa-danger' : 'border-clarissa-secondary/50'} 
                   rounded-lg shadow-sm placeholder-gray-400 
                   focus:outline-none focus:ring-1 ${error ? 'focus:ring-clarissa-danger focus:border-clarissa-danger' : 'focus:ring-clarissa-primary focus:border-clarissa-primary'} 
                   sm:text-sm bg-white text-clarissa-dark ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-clarissa-danger">{error}</p>}
    </div>
  );
};
