import React, { createContext, useContext, useState } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, number>) => string;
}

const translations = {
  zh: {
    'app.title': '藥局環境監控',
    'app.subtitle': '查詢處方疑義紀錄，並檢視相關資訊',
    'search.button': '搜尋',
    'search.field.patientCode': '病歷號',
    'search.field.department': '科別',
    'search.field.operator': '操作者',
    'search.field.reporter': '提報人員',
    'search.placeholder.patientCode': '搜尋病歷號',
    'search.placeholder.department': '搜尋科別',
    'search.placeholder.operator': '搜尋操作者',
    'search.placeholder.reporter': '搜尋提報人員',
    'export.button': '匯出',
    'filter.placeholder': '搜尋病歷號',
    'date.startLabel': '開始日期時間',
    'date.endLabel': '結束日期時間',
    'date.timeType': '時間類型',
    'date.timeType.create': '建立時間',
    'date.timeType.prescription': '開方時間',
    'date.timeType.order': '開方時間',
    'date.timeType.report': '提報時間',
    'date.timeType.handle': '處理時間',
    'table.patientCode': '病歷號',
    'table.doctor': '醫師姓名',
    'table.department': '科別',
    'table.prescriptionBagType': '藥袋類型',
    'table.orderTime': '開方時間',
    'table.createTime': '建立時間',
    'table.errorType': '錯誤類別',
    'table.status': '狀態',
    'table.operator': '操作者',
    'table.diagnosis': '診斷內容',
    'table.details': '事件詳細描述',
    'table.reportTime': '提報時間',
    'table.reporter': '提報人員',
    'table.handleTime': '處理時間',
    'table.notification': '通報',
    'table.remarks': '備註',
    'table.showAll': '顯示所有詳細資料',
    'table.recordCount': '顯示 {showing} 筆資料（共 {total} 筆）',
    'table.noRecords': '沒有符合條件的處方疑義紀錄',
    'table.records': '筆',
    'status.processed': '已處理',
    'status.processing': '處理中',
    'status.unchanged': '未更改',
    'tab.records': '歷史紀錄',
    'tab.rules': '環境監控',
    'rules.description': '規則說明',
    'rules.environment': '執行環境',
    'rules.importance': '重要程度',
    'error.loading': '載入資料時發生錯誤',
    'error.api': '系統錯誤，請稍後再試',
    'loading': '正在載入資料...',
    'download': '下載紀錄',
    'logout': '登出',
    'platform.title': '次世代整合平台',
    'copyright': 'Copyright ©2025 鴻森智能科技',
    'realtime.overview': '即時概況',
    'inpatient.pharmacy': '住院藥局',
    'drug.storage': '藥庫',
    'outpatient.pharmacy': '門急診藥局',
    'temperature': '溫度',
    'humidity': '濕度',
    'last.updated': '最後更新',
    'temp.humidity.trend.chart': '溫濕度趨勢圖表',
    'temp.humidity.trend': '溫濕度趨勢',
    'records.count': '筆數據',
    'displaying.last.8hours': '預設顯示最近8小時',
    'latest.time': '最新時間',
    'showing.records': '顯示',
  },
  en: {
    'app.title': 'Pharmacy Environment Monitoring',
    'app.subtitle': 'Query and review prescription records',
    'search.button': 'Search',
    'search.field.patientCode': 'Patient Code',
    'search.field.department': 'Department',
    'search.field.operator': 'Operator',
    'search.field.reporter': 'Reporter',
    'search.placeholder.patientCode': 'Search patient code...',
    'search.placeholder.department': 'Search department...',
    'search.placeholder.operator': 'Search operator...',
    'search.placeholder.reporter': 'Search reporter...',
    'export.button': 'Export',
    'filter.placeholder': 'Search patient ID...',
    'date.startLabel': 'Start Date & Time',
    'date.endLabel': 'End Date & Time',
    'date.timeType': 'Time Type',
    'date.timeType.create': 'Create Time',
    'date.timeType.prescription': 'Prescription Time',
    'date.timeType.order': 'Order Time',
    'date.timeType.report': 'Report Time',
    'date.timeType.handle': 'Handle Time',
    'table.patientCode': 'Patient ID',
    'table.doctor': 'Doctor',
    'table.department': 'Department',
    'table.prescriptionBagType': 'Prescription Bag Type',
    'table.orderTime': 'Order Time',
    'table.createTime': 'Create Time',
    'table.errorType': 'Error Type',
    'table.status': 'Status',
    'table.operator': 'Operator',
    'table.diagnosis': 'Diagnosis',
    'table.details': 'Event Details',
    'table.reportTime': 'Report Time',
    'table.reporter': 'Reporter',
    'table.handleTime': 'Handle Time',
    'table.notification': 'Notification',
    'table.remarks': 'Remarks',
    'table.showAll': 'Show All Details',
    'table.recordCount': 'Showing {showing} records (Total {total})',
    'table.noRecords': 'No prescription records found',
    'table.records': 'records',
    'status.processed': 'Processed',
    'status.processing': 'Processing',
    'status.unchanged': 'Unchanged',
    'tab.records': 'Historical Records',
    'tab.rules': 'Environment Monitoring',
    'rules.description': 'Rule Description',
    'rules.environment': 'Environment',
    'rules.importance': 'Importance Level',
    'error.loading': 'Error loading data',
    'error.api': 'System error, please try again later',
    'loading': 'Loading data...',
    'download': 'Download Record',
    'logout': 'Logout',
    'platform.title': 'Next Generation Platform',
    'copyright': 'Copyright ©2025 Hongsen Technology',
    'realtime.overview': 'Real-Time Overview',
    'inpatient.pharmacy': 'Inpatient Pharmacy',
    'drug.storage': 'Drug Storage',
    'outpatient.pharmacy': 'Outpatient Pharmacy',
    'temperature': 'Temperature',
    'humidity': 'Humidity',
    'last.updated': 'Last Updated',
    'temp.humidity.trend.chart': 'Temperature & Humidity Trend Chart',
    'temp.humidity.trend': 'Temp & Humidity Trend',
    'records.count': 'Records',
    'displaying.last.8hours': 'Displaying Last 8 Hours (default)',
    'latest.time': 'Latest Time',
    'showing.records': 'Showing',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const t = (key: string, params?: Record<string, number>): string => {
    let text = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value.toString());
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};