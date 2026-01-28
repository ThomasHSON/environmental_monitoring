import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-[2px]',
    medium: 'w-8 h-8 border-[3px]',
    large: 'w-12 h-12 border-[4px]',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full border-blue-300 border-t-blue-600 animate-spin`}></div>
  );
};

export default LoadingSpinner;