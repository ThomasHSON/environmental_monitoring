import React, { useMemo } from 'react';
import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TemperatureRecord } from '../../types/temperature';

interface TemperatureChartProps {
  unitName: string;
  data: TemperatureRecord[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ unitName, data }) => {
  const { t } = useLanguage();
  
  // State for controlling the visible time range and drag interaction
  const [visibleRange, setVisibleRange] = useState<{ start: number; end: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; startIndex: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Process data for chart display
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter(record => record.name === unitName)
      .sort((a, b) => new Date(a.add_time).getTime() - new Date(b.add_time).getTime())
      .map(record => ({
        timestamp: new Date(record.add_time).getTime(),
        time: record.add_time,
        temperature: record.temp || 0, // Already compensated in API processing
        humidity: record.humidity || 0, // Already compensated in API processing
        formattedTime: new Date(record.add_time).toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
  }, [data, unitName]);

  // Calculate default 8-hour range
  const defaultRange = useMemo(() => {
    if (chartData.length === 0) return null;
    
    // Get the most recent data point timestamp
    const latestDataTime = chartData[chartData.length - 1].timestamp;
    const eightHoursAgo = latestDataTime - 8 * 60 * 60 * 1000;
    
    // Find the closest data points to our 8-hour window from the latest data
    const startIndex = chartData.findIndex(d => d.timestamp >= eightHoursAgo);
    const validStartIndex = startIndex === -1 ? 0 : startIndex;
    
    // Always end at the most recent data point
    return {
      start: validStartIndex,
      end: chartData.length - 1
    };
  }, [chartData]);

  // Set initial range when data loads
  React.useEffect(() => {
    if (defaultRange && !visibleRange) {
      setVisibleRange(defaultRange);
    }
  }, [defaultRange, visibleRange]);

  // Get visible data based on current range
  const visibleData = useMemo(() => {
    if (!visibleRange || chartData.length === 0) return chartData;
    return chartData.slice(visibleRange.start, visibleRange.end + 1);
  }, [chartData, visibleRange]);

  // Handle mouse down for drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!visibleRange) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      startIndex: visibleRange.start
    });
    e.preventDefault();
  }, [visibleRange]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart || !visibleRange || chartData.length === 0) return;

    const deltaX = e.clientX - dragStart.x;
    const chartWidth = chartRef.current?.offsetWidth || 800;
    const dataPointWidth = chartWidth / (visibleRange.end - visibleRange.start + 1);
    const indexDelta = Math.round(-deltaX / dataPointWidth); // Negative for natural drag direction
    
    const newStart = Math.max(0, Math.min(
      chartData.length - (visibleRange.end - visibleRange.start + 1),
      dragStart.startIndex + indexDelta
    ));
    const newEnd = newStart + (visibleRange.end - visibleRange.start);
    
    setVisibleRange({
      start: newStart,
      end: newEnd
    });
  }, [isDragging, dragStart, visibleRange, chartData]);

  // Handle mouse up for drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Add global mouse event listeners for drag
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing !important';
      document.body.style.userSelect = 'none !important';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'auto';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800 mb-2">
            {new Date(label).toLocaleString('zh-TW')}
          </p>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                溫度: <span className="font-medium">{data.temperature.toFixed(1)}°C</span>
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                濕度: <span className="font-medium">{data.humidity.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = (props: any) => {
    return (
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
          <span className="text-sm text-gray-600">{t('temperature')} (°C)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">{t('humidity')} (%)</span>
        </div>
      </div>
    );
  };

  // Format X-axis labels
  const formatXAxisLabel = (tickItem: string) => {
    return new Date(tickItem).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{unitName} - {t('temp.humidity.trend')}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>暫無數據</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{unitName} - {t('temp.humidity.trend')}</h3>
        <div className="text-sm text-gray-500">
          共 {chartData.length} {t('records.count')} | {t('displaying.last.8hours')} | {t('latest.time')}: {chartData.length > 0 ? new Date(chartData[chartData.length - 1].timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '-'} | {t('showing.records')} {visibleData.length} {t('records.count')}
        </div>
      </div>

      <div 
        ref={chartRef}
        className="h-96 select-none"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{
              top: 20,
              right: 60,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f0f0f0"
              horizontal={true}
              vertical={false}
            />
            
            {/* Temperature Y-axis (left) */}
            <YAxis
              yAxisId="temp"
              orientation="left"
              stroke="#ef4444"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `${value}°C`}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            
            {/* Humidity Y-axis (right) */}
            <YAxis
              yAxisId="humidity"
              orientation="right"
              stroke="#3b82f6"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            
            {/* X-axis */}
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatXAxisLabel}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Temperature line */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />
            
            {/* Humidity line */}
            <Line
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend />

      {/* Usage instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>使用說明：</strong>點擊並拖拽圖表可左右滑動查看不同時間段，預設顯示最近8小時數據
        </p>
      </div>

      {/* Data summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-red-600">{t('temperature')}範圍：</span>
          {Math.min(...visibleData.map(d => d.temperature)).toFixed(1)}°C - {Math.max(...visibleData.map(d => d.temperature)).toFixed(1)}°C
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">{t('humidity')}範圍：</span>
          {Math.min(...visibleData.map(d => d.humidity)).toFixed(1)}% - {Math.max(...visibleData.map(d => d.humidity)).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;