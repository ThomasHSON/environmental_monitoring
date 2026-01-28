import React from 'react';
import { Thermometer, Droplets, Clock, AlertTriangle } from 'lucide-react';
import { ProcessedTemperatureRecord } from '../../types/temperature';
import { formatDateTime } from '../../utils/dateUtils';
import { alertSoundManager } from '../../utils/alertSound';
import { useLanguage } from '../../contexts/LanguageContext';

interface TemperatureOverviewCardProps {
  record: ProcessedTemperatureRecord;
  globalThresholds: { temp_max: number; temp_min: number; humi_max: number; humi_min: number };
}

const TemperatureOverviewCard: React.FC<TemperatureOverviewCardProps> = ({ 
  record, 
  globalThresholds 
}) => {
  const { t } = useLanguage();

  // Use the processed values (already compensated with offsets)
  const temperature = record.temp;
  const humidity = record.humidity;

  // Check if values are outside thresholds
  const isTempAlert = temperature > record.temp_max || temperature < record.temp_min;
  const isHumidityAlert = humidity > record.humidity_max || humidity < record.humidity_min;
  const hasAlert = isTempAlert || isHumidityAlert;

  // Only play alert if the unit has alerts enabled
  const shouldPlayAlert = hasAlert && record.alert;

  // Play alert sound if there's an alert
  React.useEffect(() => {
    if (shouldPlayAlert && !alertSoundManager.getMuteStatus()) {
      alertSoundManager.playAlert();
    }
  }, [shouldPlayAlert]);

  // Function to get temperature color based on configurable thresholds
  const getTemperatureColor = (temp: number) => {
    if (temp < record.temp_min) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (temp > record.temp_max) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Function to get humidity color based on configurable thresholds
  const getHumidityColor = (humidity: number) => {
    if (humidity < record.humidity_min) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (humidity > record.humidity_max) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const tempColorClass = getTemperatureColor(temperature);
  const humidityColorClass = getHumidityColor(humidity);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 ${shouldPlayAlert ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      {/* Unit Name */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          {record.name}
          {!record.alert && (
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              警報已停用
            </span>
          )}
        </h3>
      </div>

      {/* Alert Indicator */}
      {shouldPlayAlert && (
        <div className="mb-4 p-2 bg-red-100 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">警告：數值超出設定範圍</span>
        </div>
      )}
      
      {/* Alert disabled but values out of range */}
      {hasAlert && !record.alert && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-200 rounded-lg flex items-center text-yellow-800">
          <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">數值超出範圍（警報已停用）</span>
        </div>
      )}

      {/* Temperature and Humidity */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Temperature */}
        <div className={`rounded-lg p-4 border ${tempColorClass}`}>
          <div className="flex items-center justify-between mb-2">
            <Thermometer size={20} />
            <span className="text-xs font-medium uppercase tracking-wider">{t('temperature')}</span>
          </div>
          <div className="text-2xl font-bold">
            {temperature.toFixed(1)}°C
          </div>
        </div>

        {/* Humidity */}
        <div className={`rounded-lg p-4 border ${humidityColorClass}`}>
          <div className="flex items-center justify-between mb-2">
            <Droplets size={20} />
            <span className="text-xs font-medium uppercase tracking-wider">{t('humidity')}</span>
          </div>
          <div className="text-2xl font-bold">
            {humidity.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Last Update Time */}
      <div className="flex items-center text-sm text-gray-500 border-t border-gray-100 pt-3">
        <Clock size={16} className="mr-2" />
        <span>{t('last.updated')}：{formatDateTime(record.add_time)}</span>
      </div>
    </div>
  );
};

export default TemperatureOverviewCard;