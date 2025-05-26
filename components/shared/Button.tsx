import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center transform hover:scale-[1.03] active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-transparent hover:bg-blue-50 text-blue-600 focus:ring-blue-500 border border-blue-600",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-blue-100 text-blue-600 focus:ring-blue-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const loadingSpinner = (
    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed hover:scale-100' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? loadingSpinner : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;