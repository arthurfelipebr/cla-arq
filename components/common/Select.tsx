
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string; // Added labelClassName prop
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  error,
  options,
  icon,
  className,
  containerClassName,
  labelClassName, // Destructure the new prop
  ...props
}) => {
  return (
    <div className={`w-full ${containerClassName || ''}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`block text-sm font-medium text-clarissa-dark mb-1 ${labelClassName || ''}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-gray-400' })}
          </div>
        )}
        <select
          id={name}
          name={name}
          className={`block w-full appearance-none px-3 py-2 border ${error ? 'border-clarissa-danger' : 'border-clarissa-secondary/50'} 
                     rounded-lg shadow-sm placeholder-gray-400 
                     focus:outline-none focus:ring-1 ${error ? 'focus:ring-clarissa-danger focus:border-clarissa-danger' : 'focus:ring-clarissa-primary focus:border-clarissa-primary'} 
                     sm:text-sm bg-white text-clarissa-dark
                     ${icon ? 'pl-10' : ''} ${className || ''}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.97-2.97a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-clarissa-danger">{error}</p>}
    </div>
  );
};
