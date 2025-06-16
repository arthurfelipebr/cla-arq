
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: 'bg-clarissa-primary text-white hover:bg-clarissa-primaryhover focus:ring-clarissa-primary',
    secondary: 'bg-clarissa-secondary text-white hover:bg-opacity-80 focus:ring-clarissa-secondary',
    danger: 'bg-clarissa-danger text-white hover:bg-opacity-80 focus:ring-clarissa-danger',
    ghost: 'bg-transparent text-clarissa-primary hover:bg-clarissa-primary/10 focus:ring-clarissa-primary',
    outline: 'bg-transparent text-clarissa-primary border border-clarissa-primary hover:bg-clarissa-primary/10 focus:ring-clarissa-primary',
    link: 'bg-transparent text-clarissa-primary hover:underline focus:ring-clarissa-primary/50 p-0 focus:ring-offset-0', // Added link variant
  };

  // For link variant, we might want to ensure size styles don't add unwanted padding if className already specifies p-0
  const currentSizeStyles = variant === 'link' && (className.includes('p-0') || className.includes('px-0') || className.includes('py-0')) 
                            ? '' 
                            : sizeStyles[size];


  return (
    <button
      className={`${baseStyles} ${currentSizeStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
