import React from 'react';
import { Download } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';

interface ExportButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner size="small" className="mr-2" />
      ) : (
        <Download size={18} className="mr-2" />
      )}
      {t('export.button')}
    </button>
  );
};

export default ExportButton;