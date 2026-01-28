import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  children, 
  subtitle,
  className = '' 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
        {children}
      </h1>
      {subtitle && (
        <p className="text-gray-600 text-sm mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTitle;