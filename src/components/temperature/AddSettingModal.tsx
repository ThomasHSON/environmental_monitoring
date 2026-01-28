import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { TemperatureUnitSetting } from '../../types/settings';
import LoadingSpinner from '../common/LoadingSpinner';

interface AddSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (setting: Omit<TemperatureUnitSetting, 'GUID'>) => Promise<void>;
}

const AddSettingModal: React.FC<AddSettingModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    IP: '',
    name: '',
    temp_max: '30',
    temp_min: '20',
    temp_offset: '2',
    humidity_max: '70',
    humidity_min: '50',
    humidity_offset: '10',
    alert: true,
    mail: true,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        IP: '',
        name: '',
        temp_max: '30',
        temp_min: '20',
        temp_offset: '0',
        humidity_max: '70',
        humidity_min: '50',
        humidity_offset: '0',
        alert: true,
        mail: true,
      });
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.IP.trim()) {
      return 'IP 位址為必填欄位';
    }
    if (!formData.name.trim()) {
      return '名稱為必填欄位';
    }
    
    const tempMin = parseFloat(formData.temp_min);
    const tempMax = parseFloat(formData.temp_max);
    const humidityMin = parseFloat(formData.humidity_min);
    const humidityMax = parseFloat(formData.humidity_max);
    const tempOffset = parseFloat(formData.temp_offset);
    const humidityOffset = parseFloat(formData.humidity_offset);
    
    if (tempMin >= tempMax) {
      return '溫度下限必須小於溫度上限';
    }
    if (humidityMin >= humidityMax) {
      return '濕度下限必須小於濕度上限';
    }
    if (tempMin < -50 || tempMax > 100) {
      return '溫度設定範圍應在 -50°C 到 100°C 之間';
    }
    if (humidityMin < 0 || humidityMax > 100) {
      return '濕度設定範圍應在 0% 到 100% 之間';
    }
    if (isNaN(tempOffset)) {
      return '溫度偏移值必須是有效數字';
    }
    if (isNaN(humidityOffset)) {
      return '濕度偏移值必須是有效數字';
    }
    
    return null;
  };

  const handleAdd = async () => {
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsAdding(true);

    try {
      // Convert form data to API format
      const settingToAdd: Omit<TemperatureUnitSetting, 'GUID'> = {
        IP: formData.IP.trim(),
        name: formData.name.trim(),
        temp_max: formData.temp_max,
        temp_min: formData.temp_min,
        temp_offset: formData.temp_offset,
        humidity_max: formData.humidity_max,
        humidity_min: formData.humidity_min,
        humidity_offset: formData.humidity_offset,
        alert: formData.alert ? "True" : "False",
        mail: formData.mail ? "True" : "False",
      };

      await onAdd(settingToAdd);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增設定失敗，請稍後再試');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Plus size={24} className="text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">新增溫濕度設定</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP 位址 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.IP}
                onChange={(e) => handleInputChange('IP', e.target.value)}
                disabled={isAdding}
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                placeholder="例如: 192.168.1.100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isAdding}
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                placeholder="例如: 門診藥局"
              />
            </div>
          </div>

          {/* Alert and Mail Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alert-enabled"
                checked={formData.alert}
                onChange={(e) => handleInputChange('alert', e.target.checked)}
                disabled={isAdding}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="alert-enabled" className="ml-2 text-sm font-medium text-gray-700">
                啟用聲音警報
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mail-enabled"
                checked={formData.mail}
                onChange={(e) => handleInputChange('mail', e.target.checked)}
                disabled={isAdding}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="mail-enabled" className="ml-2 text-sm font-medium text-gray-700">
                啟用郵件通知
              </label>
            </div>
          </div>

          {/* Temperature Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              溫度警報設定
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  溫度下限 (°C)
                </label>
                <input
                  type="number"
                  value={formData.temp_min}
                  onChange={(e) => handleInputChange('temp_min', e.target.value)}
                  disabled={isAdding}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="20"
                  min="-50"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  溫度上限 (°C)
                </label>
                <input
                  type="number"
                  value={formData.temp_max}
                  onChange={(e) => handleInputChange('temp_max', e.target.value)}
                  disabled={isAdding}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="30"
                  min="-50"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  溫度偏移 (°C)
                </label>
                <input
                  type="text"
                  value={formData.temp_offset}
                  onChange={(e) => handleInputChange('temp_offset', e.target.value)}
                  disabled={isAdding}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Humidity Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              濕度警報設定
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  濕度下限 (%)
                </label>
                <input
                  type="number"
                  value={formData.humidity_min}
                  onChange={(e) => handleInputChange('humidity_min', e.target.value)}
                  disabled={isAdding}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="50"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  濕度上限 (%)
                </label>
                <input
                  type="number"
                  value={formData.humidity_max}
                  onChange={(e) => handleInputChange('humidity_max', e.target.value)}
                  disabled={isAdding}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="70"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  濕度偏移 (%)
                </label>
                <input
                  type="text"
                  value={formData.humidity_offset}
                  onChange={(e) => handleInputChange('humidity_offset', e.target.value)}
                  disabled={isAdding}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={isAdding || !formData.IP.trim() || !formData.name.trim()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                新增中...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                新增設定
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSettingModal;