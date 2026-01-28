import React, { useState, useEffect } from 'react';
import PrescriptionQueryPage from './pages/PrescriptionQueryPage';
import { LoginPage } from './pages/LoginPage';
import { loadConfig } from './config';
import { LanguageProvider } from './contexts/LanguageContext';
import { isAuthenticated } from './services/auth';

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await loadConfig();
        setConfigLoaded(true);
        
        // Check authentication status
        const authenticated = isAuthenticated();
        setIsLoggedIn(authenticated);
        
        console.log('Authentication check:', {
          authenticated,
          userSession: sessionStorage.getItem('user_session') ? 'exists' : 'missing'
        });
      } catch (error) {
        console.error('Failed to load configuration:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initApp();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!configLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      {isLoggedIn ? (
        <PrescriptionQueryPage />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </LanguageProvider>
  );
}

export default App;