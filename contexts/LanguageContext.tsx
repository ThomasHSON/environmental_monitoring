import React, { createContext, useContext, useState } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}
const translations = {
  zh: {
    'app.title': '藥局環境監控',
    
  },
  en: {
    'app.title': 'Pharmacy Environment Monitoring',
   
  },
};
