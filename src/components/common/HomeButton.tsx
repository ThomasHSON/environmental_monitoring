import React from 'react';
import { Layers } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getConfig } from '../../config';

interface HomeButtonProps {
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ className = '' }) => {
  const { t } = useLanguage();

  const handleHomeClick = () => {
    const config = getConfig();
    if (config?.homepage) {
      window.location.href = `${config.homepage}/phar_system/frontpage/`;
    }
  };

  return (
    <button
      onClick={handleHomeClick}
      className={`p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors group relative ${className}`}
      title={t('platform.title')}
    >
      <Layers size={24} />
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {t('platform.title')}
      </span>
    </button>
  );
};

export default HomeButton;