import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-4',
    medium: 'w-12 h-12 border-[6px]',
    large: 'w-16 h-16 border-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4" role="status" aria-live="polite">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-600 border-t-transparent`}
      >
      </div>
      {message && <p className="mt-3 text-lg text-blue-700 font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;