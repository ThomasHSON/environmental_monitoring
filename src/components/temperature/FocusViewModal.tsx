import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ProcessedTemperatureRecord } from '../../types/temperature';
import { UnitTemperatureThresholds } from '../../types/settings';
import TemperatureOverviewCard from './TemperatureOverviewCard';
import MuteAlarmButton from './MuteAlarmButton';
import { useLanguage } from '../../contexts/LanguageContext';

interface FocusViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestData: ProcessedTemperatureRecord[];
  globalThresholds: { temp_max: number; temp_min: number; humi_max: number; humi_min: number };
  lastRefresh: Date | null;
}

const FocusViewModal: React.FC<FocusViewModalProps> = ({
  isOpen,
  onClose,
  latestData,
  globalThresholds,
  lastRefresh,
}) => {
  const { t } = useLanguage();

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header with close button and last update time */}
      <div className="flex items-center justify-between p-6 bg-gray-900 text-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{t('tab.rules')}</h1>
          {lastRefresh && (
            <span className="text-gray-300 text-sm">
              {t('last.updated')}：{lastRefresh.toLocaleTimeString('zh-TW')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <MuteAlarmButton />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="關閉專注顯示 (ESC)"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {latestData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl">暫無即時數據</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
            {latestData.map((record) => (
              <div key={record.GUID} className="transform scale-110">
                <TemperatureOverviewCard
                  record={record}
                  globalThresholds={globalThresholds}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with instructions */}
      <div className="bg-gray-900 text-gray-300 py-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-3">
            <img
              src="/hs_logo.png"
              alt="鴻森智能科技"
              className="h-10 w-auto"
            />
            <span className="text-lg font-medium">鴻森智能科技股份有限公司</span>
          </div>
          <div className="text-sm text-gray-400">
            按 ESC 鍵或點擊右上角 ✕ 按鈕退出專注顯示模式
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusViewModal;