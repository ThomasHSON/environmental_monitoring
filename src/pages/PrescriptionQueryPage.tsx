import React, { useState, useEffect } from 'react';
import { DateTimeSelector } from '../components/DateTimeSelector';
import PrescriptionTable from '../components/prescription/PrescriptionTable';
import PrescriptionFilter from '../components/prescription/PrescriptionFilter';
import EnvironmentMonitoring from '../components/temperature/EnvironmentMonitoring';
import TemperatureChart from '../components/temperature/TemperatureChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LogoutButton from '../components/LogoutButton';
import LanguageToggle from '../components/LanguageToggle';
import ExportButton from '../components/common/ExportButton';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchPrescriptionRecords, downloadPrescriptionRecords } from '../services/api';
import { fetchTemperatureByTime } from '../services/temperature';
import { loadConfig, getConfig } from '../config';
import { getUserSession } from '../services/auth';
import { 
  PrescriptionRecord, 
  SortConfig,
  FilterConfig
} from '../types/prescription';
import { TemperatureRecord } from '../types/temperature';
import { 
  formatDateForInput, 
  formatTimeForInput,
  combineDateTimeString,
  getDefaultDateRange,
  getTodayDateRange
} from '../utils/dateUtils';
import { Layers } from 'lucide-react';

type ActiveTab = 'records' | 'rules';
type TimeType = 'create' | 'prescription';

const PrescriptionQueryPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('rules');
  const [timeType, setTimeType] = useState<TimeType>('create');
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(formatDateForInput(defaultRange.startDate));
  const [startTime, setStartTime] = useState(formatTimeForInput(defaultRange.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(defaultRange.endDate));
  const [endTime, setEndTime] = useState(formatTimeForInput(defaultRange.endDate));
  const [records, setRecords] = useState<PrescriptionRecord[]>([]);
  const [temperatureData, setTemperatureData] = useState<TemperatureRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'CREATE_TIME', 
    direction: 'descending' 
  });
  const [filter, setFilter] = useState<FilterConfig>({ 
    searchField: 'patientCode', 
    searchValue: '' 
  });

  const userSession = getUserSession();
  const userInfo = userSession ? `${userSession.Name} - ${userSession.Employer}` : '鴻森智能科技 - 臨床藥事科';

  // Update date range when switching to records tab
  useEffect(() => {
    if (activeTab === 'records') {
      const todayRange = getTodayDateRange();
      setStartDate(formatDateForInput(todayRange.startDate));
      setStartTime(formatTimeForInput(todayRange.startDate));
      setEndDate(formatDateForInput(todayRange.endDate));
      setEndTime(formatTimeForInput(todayRange.endDate));
    }
  }, [activeTab]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadConfig();
        if (activeTab === 'records') {
          await handleTemperatureSearch();
        }
      } catch (error) {
        setError('Failed to initialize: ' + (error instanceof Error ? error.message : String(error)));
      }
    };

    initializeData();
  }, [activeTab]);

  const handleRecordUpdate = (updatedRecord: PrescriptionRecord) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.GUID === updatedRecord.GUID ? updatedRecord : record
      )
    );
  };

  const handleTemperatureSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDateTime = combineDateTimeString(startDate, startTime);
      const endDateTime = combineDateTimeString(endDate, endTime);
      
      const response = await fetchTemperatureByTime(startDateTime, endDateTime);
      if (response.Code === 200) {
        setTemperatureData(response.Data);
      } else {
        throw new Error(response.Result || '載入溫度數據失敗');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入溫度數據時發生錯誤');
      setTemperatureData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (key: keyof PrescriptionRecord) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        };
      }
      return { key, direction: 'ascending' };
    });
  };

  const handleSearch = async () => {
    if (activeTab === 'records') {
      // Handle temperature data search for historical records
      await handleTemperatureSearch();
    } else {
      // Keep existing prescription search logic for other tabs if needed
      setLoading(true);
      setError(null);
      
      try {
        const startDateTime = combineDateTimeString(startDate, startTime);
        const endDateTime = combineDateTimeString(endDate, endTime);
        
        const response = await fetchPrescriptionRecords(startDateTime, endDateTime, timeType);
        setRecords(response.Data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = async () => {
    if (downloading || records.length === 0) return;
    
    setDownloading(true);
    try {
      await downloadPrescriptionRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : '匯出失敗');
    } finally {
      setDownloading(false);
    }
  };

  const handleHomeClick = () => {
    const config = getConfig();
    if (config?.homepage) {
      window.location.href = `${config.homepage}/phar_system/frontpage/`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-8">
        <div className="max-w-screen-xl mx-auto">
          <header className="h-[80px] mb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleHomeClick}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors group relative"
                  title={t('platform.title')}
                >
                  <Layers size={24} />
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {t('platform.title')}
                  </span>
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    {t('app.title')}
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

          <div className="h-[40px] mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('rules')}
                  className={`py-2 px-1 border-b-2 text-base font-medium uppercase tracking-wider ${
                    activeTab === 'rules'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {t('tab.rules')}
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-2 px-1 border-b-2 text-base font-medium uppercase tracking-wider ${
                    activeTab === 'records'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {t('tab.records')}
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'rules' ? (
            <EnvironmentMonitoring />
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-6">
                <DateTimeSelector
                  startDate={startDate}
                  startTime={startTime}
                  endDate={endDate}
                  endTime={endTime}
                  onStartDateChange={setStartDate}
                  onStartTimeChange={setStartTime}
                  onEndDateChange={setEndDate}
                  onEndTimeChange={setEndTime}
                />
              </div>

              <div className="h-[52px] mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {temperatureData.length > 0 && (
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold text-gray-800">
                        {t('temp.humidity.trend.chart')}
                      </h2>
                      <span className="ml-3 text-sm text-gray-500 font-medium">
                        ({temperatureData.length} {t('records.count')})
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleTemperatureSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : null}
                    {t('search.button')} {t('temp.humidity.trend')}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                  <div>
                    <h3 className="font-medium text-red-800">{t('error.loading')}</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {loading && !error ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 flex items-center justify-center">
                  <LoadingSpinner size="large" />
                  <span className="ml-3 text-gray-500">{t('loading')} {t('temp.humidity.trend')}...</span>
                </div>
              ) : (
                <>
                  {temperatureData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center mb-12">
                      <p className="text-gray-500">{t('table.noRecords')}</p>
                    </div>
                  ) : (
                    <div className="space-y-6 mb-12">
                      {Array.from(new Set(temperatureData.map(record => record.name))).map((unitName) => (
                        <TemperatureChart
                          key={unitName}
                          unitName={unitName}
                          data={temperatureData}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 text-center text-gray-600 text-sm z-10">
        {t('copyright')}
      </footer>
    </div>
  );
};

export default PrescriptionQueryPage;