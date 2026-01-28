import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LogoutButton from '../LogoutButton';
import LanguageToggle from '../LanguageToggle';
import { getUserSession } from '../../services/auth';
import HomeButton from '../common/HomeButton';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t } = useLanguage();
  const userSession = getUserSession();
  const userInfo = userSession ? `${userSession.Name} - ${userSession.Employer}` : '鴻森智能科技 - 臨床藥事科';

  return (
    <header className="h-[80px] mb-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <HomeButton />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {title}
            </h1>
            <p className="text-gray-600 text-sm">
              {userInfo}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;