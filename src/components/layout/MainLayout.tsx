import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-8">
        <div className="max-w-screen-xl mx-auto">
          <Header title={title} />
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;