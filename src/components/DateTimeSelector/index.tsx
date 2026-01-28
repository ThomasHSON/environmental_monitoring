import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

type TimeType = 'create' | 'prescription';

interface DateTimeSelectorProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  timeType?: TimeType;
  onTimeTypeChange?: (type: TimeType) => void;
  className?: string;
}

export function DateTimeSelector({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  timeType,
  onTimeTypeChange,
  className = '',
}: DateTimeSelectorProps) {
  const { t } = useLanguage();
  
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-6">
        {timeType && onTimeTypeChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('date.timeType')}</label>
            <select
              value={timeType}
              onChange={(e) => onTimeTypeChange(e.target.value as TimeType)}
              className="w-40 border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="create">{t('date.timeType.create')}</option>
              <option value="prescription">{t('date.timeType.prescription')}</option>
            </select>
          </div>
        )}

        <div className={`flex-1 ${timeType && onTimeTypeChange ? 'min-w-[600px]' : 'min-w-[800px]'} grid grid-cols-2 gap-6`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('date.startLabel')}</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-[180px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="YYYY-MM-DD"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-[180px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                step="1"
                placeholder="HH:mm:ss"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('date.endLabel')}</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-[180px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                step="1"
                placeholder="YYYY-MM-DD"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-[180px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                step="1"
                placeholder="HH:mm:ss"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}