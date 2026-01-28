import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, Settings, Maximize } from 'lucide-react';
import { TemperatureRecord, ProcessedTemperatureRecord } from '../../types/temperature';
import { UnitTemperatureThresholds, TemperatureUnitSetting } from '../../types/settings';
import { fetchLatestTemperatureData, fetchTodayTemperatureData } from '../../services/temperature';
import { 
  fetchTemperatureSettings, 
  parseTemperatureThresholds, 
  getGlobalThresholds,
  getDefaultThresholds 
} from '../../services/settings';
import TemperatureOverviewCard from './TemperatureOverviewCard';
import TemperatureChart from './TemperatureChart';
import MuteAlarmButton from './MuteAlarmButton';
import SettingsModal from './SettingsModal';
import FocusViewModal from './FocusViewModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { alertSoundManager } from '../../utils/alertSound';

const EnvironmentMonitoring: React.FC = () => {
  const { t } = useLanguage();
  const [latestData, setLatestData] = useState<ProcessedTemperatureRecord[]>([]);
  const [chartData, setChartData] = useState<TemperatureRecord[]>([]);
  const [allThresholds, setAllThresholds] = useState<UnitTemperatureThresholds[]>([]);
  const [globalThresholds, setGlobalThresholds] = useState({ temp_max: 25, temp_min: 15, humi_max: 70, humi_min: 40 });
  const [settings, setSettings] = useState<TemperatureUnitSetting[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFocusViewOpen, setIsFocusViewOpen] = useState(false);

  // Auto-refresh interval (5 minutes)
  const REFRESH_INTERVAL = 5 * 60 * 1000;

  useEffect(() => {
    loadData();
    loadThresholds();
    
    // Set up auto-refresh
    const interval = setInterval(loadData, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadLatestData(),
      loadChartData(),
      loadThresholds()
    ]);
    setLastRefresh(new Date());
  };

  const loadLatestData = async () => {
    setLoadingLatest(true);
    setError(null);
    
    // Reset mute status on each data refresh
    alertSoundManager.resetMuteStatus();
    
    try {
      const response = await fetchLatestTemperatureData();
      if (response.Code === 200) {
        setLatestData(response.Data);
      } else {
        throw new Error(response.Result || '載入最新數據失敗');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入最新數據時發生錯誤');
      console.error('Error loading latest temperature data:', err);
    } finally {
      setLoadingLatest(false);
    }
  };

  const loadChartData = async () => {
    setLoadingChart(true);
    
    try {
      const response = await fetchTodayTemperatureData();
      if (response.Code === 200) {
        setChartData(response.Data);
      } else {
        throw new Error(response.Result || '載入圖表數據失敗');
      }
    } catch (err) {
      // Handle backend error with user-friendly message
      let errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Object reference not set to an instance of an object')) {
        errorMessage = '載入圖表數據失敗：伺服器內部錯誤';
      }
      console.error('Error loading chart data:', errorMessage);
      // Don't set error for chart data to avoid blocking the overview
    } finally {
      setLoadingChart(false);
    }
  };

  const loadThresholds = async () => {
    try {
      const response = await fetchTemperatureSettings();
      if (response.Code === 200) {
        const rawSettings = response.Data;
        setSettings(rawSettings);
        
        const parsedThresholds = parseTemperatureThresholds(response);
        setAllThresholds(parsedThresholds);
        
        const globalThresholds = getGlobalThresholds(parsedThresholds);
        setGlobalThresholds(globalThresholds);
        
        console.log('Loaded temperature thresholds:', {
          allThresholds: parsedThresholds,
          globalThresholds
        });
      } else {
        console.warn('Failed to load thresholds, using defaults');
        const defaultThresholds = getDefaultThresholds();
        setAllThresholds([defaultThresholds]);
        setGlobalThresholds({
          temp_max: defaultThresholds.temp_max,
          temp_min: defaultThresholds.temp_min,
          humi_max: defaultThresholds.humidity_max,
          humi_min: defaultThresholds.humidity_min,
        });
      }
    } catch (err) {
      console.error('Error loading temperature thresholds:', err);
      const defaultThresholds = getDefaultThresholds();
      setAllThresholds([defaultThresholds]);
      setGlobalThresholds({
        temp_max: defaultThresholds.temp_max,
        temp_min: defaultThresholds.temp_min,
        humi_max: defaultThresholds.humidity_max,
        humi_min: defaultThresholds.humidity_min,
      });
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleSettingsUpdate = () => {
    // Reload thresholds after settings update
    loadThresholds();
  };

  // Get unique unit names for charts
  const uniqueUnits = Array.from(new Set(chartData.map(record => record.name)));

  return (
    <div className="space-y-8 mb-12">

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle size={20} className="text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">載入數據時發生錯誤</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Top Section: Real-time Overview */}
      <section>
        {/* Header row with label, last update time, and refresh button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{t('realtime.overview')}</h3>
          <div className="flex items-center space-x-3">
            <MuteAlarmButton />
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
              title="警報設定"
            >
              <Settings size={16} className="mr-2" />
              設定
            </button>
            <button
              onClick={() => setIsFocusViewOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              title="專注顯示模式"
            >
              <Maximize size={16} className="mr-2" />
              專注顯示
            </button>
            <button
              onClick={handleRefresh}
              disabled={loadingLatest || loadingChart}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw 
                size={16} 
                className={`mr-2 ${(loadingLatest || loadingChart) ? 'animate-spin' : ''}`} 
              />
              重新整理
            </button>
          </div>
        </div>
        
        {loadingLatest ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 flex items-center justify-center">
            <LoadingSpinner size="large" />
            <span className="ml-3 text-gray-500">載入即時數據中...</span>
          </div>
        ) : latestData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-500">暫無即時數據</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestData.map((record) => (
              <TemperatureOverviewCard 
                key={record.GUID} 
                record={record} 
                globalThresholds={globalThresholds}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom Section: Daily Line Charts */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('temp.humidity.trend.chart')}</h3>
        
        {loadingChart ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 flex items-center justify-center">
            <LoadingSpinner size="large" />
            <span className="ml-3 text-gray-500">載入圖表數據中...</span>
          </div>
        ) : uniqueUnits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-500">暫無圖表數據</p>
          </div>
        ) : (
          <div className="space-y-6">
            {uniqueUnits.map((unitName) => (
              <TemperatureChart
                key={unitName}
                unitName={unitName}
                data={chartData}
              />
            ))}
          </div>
        )}
      </section>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        allThresholds={allThresholds}
        globalThresholds={globalThresholds}
        onSettingsUpdate={handleSettingsUpdate}
      />

      {/* Focus View Modal */}
      <FocusViewModal
        isOpen={isFocusViewOpen}
        onClose={() => setIsFocusViewOpen(false)}
        latestData={latestData}
        allThresholds={allThresholds}
        globalThresholds={globalThresholds}
        lastRefresh={lastRefresh}
      />
    </div>
  );
};

export default EnvironmentMonitoring;