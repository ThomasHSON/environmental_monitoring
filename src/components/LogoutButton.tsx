import React from 'react';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { logout } from '../services/auth';

const LogoutButton: React.FC = () => {
  const { t } = useLanguage();

  return (
    <button
      onClick={logout}
      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {t('logout')}
    </button>
  );
};

export default LogoutButton;