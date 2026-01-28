import React, { useState, useEffect } from 'react';
import { X, Save, Settings, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { TemperatureUnitSetting, UnitTemperatureThresholds } from '../../types/settings';
import { updateTemperatureSettings, addTemperatureSetting, deleteTemperatureSetting } from '../../services/settings';
import LoadingSpinner from '../common/LoadingSpinner';
import AddSettingModal from './AddSettingModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allThresholds: UnitTemperatureThresholds[];
  globalThresholds: { temp_max: number; temp_min: number; humi_max: number; humi_min: number };
  onSettingsUpdate: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  allThresholds,
  globalThresholds,
  onSettingsUpdate,
}) => {
  const [formData, setFormData] = useState<UnitTemperatureThresholds[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when modal opens or thresholds change
  useEffect(() => {
    if (isOpen) {
      setFormData([...allThresholds]);
      setSelectedUnit(allThresholds.length > 0 ? allThresholds[0].GUID : '');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, allThresholds]);

  const handleInputChange = (unitGUID: string, field: keyof UnitTemperatureThresholds, value: string | boolean) => {
    setFormData(prev => prev.map(unit => {
      if (unit.GUID === unitGUID) {
        if (typeof value === 'boolean') {
          return { ...unit, [field]: value };
        }
        // For offset fields, keep as string to allow typing negative values
        if (field === 'temp_offset' || field === 'humidity_offset') {
          return { ...unit, [field]: value as string };
        }
        // For other numeric fields, parse immediately
        const numValue = parseFloat(value as string) || 0;
        return { ...unit, [field]: numValue };
      }
      return unit;
    }));
  };

  const handleInputChangeIP = (unitGUID: string, value: string) => {
    setFormData(prev => prev.map(unit => {
      if (unit.GUID === unitGUID) {
        return { ...unit, IP: value };
      }
      return unit;
    }));
  };

  const getSelectedUnit = (): UnitTemperatureThresholds | null => {
    return formData.find(unit => unit.GUID === selectedUnit) || null;
  };

  const validateUnit = (unit: UnitTemperatureThresholds): string | null => {
    if (unit.temp_min >= unit.temp_max) {
      return `${unit.name}: 溫度下限必須小於溫度上限`;
    }
    if (unit.humidity_min >= unit.humidity_max) {
      return `${unit.name}: 濕度下限必須小於濕度上限`;
    }
    if (unit.temp_min < -50 || unit.temp_max > 100) {
      return `${unit.name}: 溫度設定範圍應在 -50°C 到 100°C 之間`;
    }
    if (unit.humidity_min < 0 || unit.humidity_max > 100) {
      return `${unit.name}: 濕度設定範圍應在 0% 到 100% 之間`;
    }
    
    // Validate offset values are valid numbers
    const tempOffset = parseFloat(unit.temp_offset.toString());
    const humidityOffset = parseFloat(unit.humidity_offset.toString());
    
    if (isNaN(tempOffset)) {
      return `${unit.name}: 溫度偏移值必須是有效數字`;
    }
    if (isNaN(humidityOffset)) {
      return `${unit.name}: 濕度偏移值必須是有效數字`;
    }
    
    return null;
  };

  const validateForm = (): string | null => {
    for (const unit of formData) {
      const unitError = validateUnit(unit);
      if (unitError) return unitError;
    }
    return null;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      // Convert form data to API format
      const settingsToUpdate: TemperatureUnitSetting[] = formData.map(unit => ({
        GUID: unit.GUID,
        IP: unit.IP,
        name: unit.name,
        temp_max: unit.temp_max.toString(),
        temp_min: unit.temp_min.toString(),
        temp_offset: parseFloat(unit.temp_offset.toString()).toString(),
        humidity_max: unit.humidity_max.toString(),
        humidity_min: unit.humidity_min.toString(),
        humidity_offset: parseFloat(unit.humidity_offset.toString()).toString(),
        alert: unit.alert ? "True" : "False",
        mail: unit.mail ? "True" : "False",
      }));

      await updateTemperatureSettings(settingsToUpdate);

      setSuccess(true);
      
      // Notify parent to refresh data
      onSettingsUpdate();

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : '更新設定失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSetting = async () => {
    if (!currentUnit) return;
    
    setIsDeleting(true);
    setError(null);
    setShowDeleteConfirm(false);

    try {
      await deleteTemperatureSetting(currentUnit.GUID);
      
      // Remove the deleted unit from formData
      setFormData(prev => prev.filter(unit => unit.GUID !== currentUnit.GUID));
      
      // Select the first remaining unit or clear selection
      const remainingUnits = formData.filter(unit => unit.GUID !== currentUnit.GUID);
      if (remainingUnits.length > 0) {
        setSelectedUnit(remainingUnits[0].GUID);
      } else {
        setSelectedUnit('');
      }
      
      // Notify parent to refresh data
      onSettingsUpdate();
      
      setSuccess(true);
      
      // Auto-close after success if no units remain
      if (remainingUnits.length === 0) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除設定失敗，請稍後再試');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSetting = async (newSetting: Omit<TemperatureUnitSetting, 'GUID'>) => {
    try {
      await addTemperatureSetting(newSetting);
      setIsAddModalOpen(false);
      onSettingsUpdate(); // Refresh the settings list
    } catch (err) {
      throw err; // Let AddSettingModal handle the error
    }
  };

  const handleClose = () => {
    if (!isSaving && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentUnit = getSelectedUnit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Settings size={24} className="text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">溫濕度警報設定</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            <Plus size={16} className="mr-2" />
            新增設定
          </button>
          {currentUnit && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving || isDeleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} className="mr-2" />
              刪除設定
            </button>
          )}
          <button
            onClick={handleClose}
            disabled={isSaving || isDeleting}
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

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              設定更新成功！
            </div>
          )}

          {/* Unit Selection */}
          {formData.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">選擇藥局單位</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
              >
                {formData.map((unit) => (
                  <option key={unit.GUID} value={unit.GUID}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentUnit && (
            <>
              {/* IP Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP 位址</label>
                <input
                  type="text"
                  value={currentUnit.IP}
                  onChange={(e) => handleInputChangeIP(currentUnit.GUID, e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="例如: 192.168.1.100"
                />
              </div>

              {/* Alert and Mail Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="alert-enabled"
                    checked={currentUnit.alert}
                    onChange={(e) => handleInputChange(currentUnit.GUID, 'alert', e.target.checked)}
                    disabled={isSaving}
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
                    checked={currentUnit.mail}
                    onChange={(e) => handleInputChange(currentUnit.GUID, 'mail', e.target.checked)}
                    disabled={isSaving}
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
                      value={currentUnit.temp_min}
                      onChange={(e) => handleInputChange(currentUnit.GUID, 'temp_min', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="15"
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
                      value={currentUnit.temp_max}
                      onChange={(e) => handleInputChange(currentUnit.GUID, 'temp_max', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="25"
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
                      value={currentUnit.temp_offset}
                      onChange={(e) => handleInputChange(currentUnit.GUID, 'temp_offset', e.target.value)}
                      disabled={isSaving}
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
                      value={currentUnit.humidity_min}
                      onChange={(e) => handleInputChange(currentUnit.GUID, 'humidity_min', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="40"
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
                      value={currentUnit.humidity_max}
                      onChange={(e) => handleInputChange(currentUnit.GUID, 'humidity_max', e.target.value)}
                      disabled={isSaving}
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
                      value={currentUnit.humidity_offset}
                      onChange={(e) => handleInputChange(currentUnit.GUID, 'humidity_offset', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isSaving || isDeleting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                儲存中...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                儲存設定
              </>
            )}
          </button>
        </div>

      </div>

      {/* Add Setting Modal */}
      <AddSettingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSetting}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && currentUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Trash2 size={24} className="text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">確認刪除設定</h3>
              </div>
              <p className="text-gray-600 mb-2">
                您確定要刪除「{currentUnit.name}」的溫濕度設定嗎？
              </p>
              <p className="text-sm text-red-600 mb-6">
                此操作無法復原，請謹慎操作。
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteSetting}
                  disabled={isDeleting}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      刪除中...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      確認刪除
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;