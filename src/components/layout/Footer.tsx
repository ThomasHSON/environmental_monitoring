import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { t } = useLanguage();

  return (
    <footer className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 text-center text-gray-600 text-sm z-10 ${className}`}>
      {t('copyright')}
    </footer>
  );
};

export default Footer;