import React from 'react';
import { Search } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  isLoading = false,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center w-24 ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        <Search size={18} className="mr-2" />
      )}
      {t('search.button')}
    </button>
  );
};

export default SearchButton;