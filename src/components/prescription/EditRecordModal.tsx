import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { PrescriptionRecord } from '../../types/prescription';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchErrorTypes, updatePrescriptionRecord } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

interface EditRecordModalProps {
  record: PrescriptionRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: PrescriptionRecord) => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    ERROR_TYPE_STRING: '',
    EVENT_DESC: '',
    REMARK: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [loadingErrorTypes, setLoadingErrorTypes] = useState(false);
  const [errorTypesError, setErrorTypesError] = useState<string | null>(null);

  // Fallback error types in case API fails
  const fallbackErrorTypes = [
    'A劑量錯誤',
    'B頻次錯誤',
    'C途徑錯誤',
    'D重複用藥',
    'E交互作用',
    'F數量錯誤',
    'G禁忌症',
    'H適應症',
    'I其他',
    'J藥物過敏',
    'K藥物不良反應',
    'L用法錯誤',
    'M劑型錯誤',
    'N濃度錯誤',
    'O其他-藥物選用適切性',
  ];

  // Load error types from API when modal opens
  useEffect(() => {
    if (isOpen) {
      loadErrorTypes();
    }
  }, [isOpen]);

  const loadErrorTypes = async () => {
    setLoadingErrorTypes(true);
    setErrorTypesError(null);
    
    try {
      const types = await fetchErrorTypes();
      setErrorTypes(types);
    } catch (err) {
      console.error('Failed to load error types:', err);
      setErrorTypesError('無法載入錯誤類別，使用預設選項');
      setErrorTypes(fallbackErrorTypes);
    } finally {
      setLoadingErrorTypes(false);
    }
  };

  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        ERROR_TYPE_STRING: record.ERROR_TYPE_STRING || '',
        EVENT_DESC: record.EVENT_DESC || '',
        REMARK: record.REMARK || '',
      });
      setError(null);
    }
  }, [isOpen, record]);

  const handleErrorTypeChange = (errorType: string, checked: boolean) => {
    const currentTypes = formData.ERROR_TYPE_STRING
      ? formData.ERROR_TYPE_STRING.split(';').map(t => t.trim()).filter(t => t)
      : [];

    let newTypes;
    if (checked) {
      newTypes = [...currentTypes, errorType];
    } else {
      newTypes = currentTypes.filter(t => t !== errorType);
    }

    // Sort alphabetically by letter code (A, B, C, etc.)
    newTypes.sort((a, b) => {
      const aCode = a.charAt(0);
      const bCode = b.charAt(0);
      return aCode.localeCompare(bCode);
    });

    setFormData({
      ...formData,
      ERROR_TYPE_STRING: newTypes.join(';'),
    });
  };

  const isErrorTypeSelected = (errorType: string) => {
    const currentTypes = formData.ERROR_TYPE_STRING
      ? formData.ERROR_TYPE_STRING.split(';').map(t => t.trim())
      : [];
    return currentTypes.includes(errorType);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.ERROR_TYPE_STRING.trim()) {
        throw new Error('請選擇至少一個錯誤類別');
      }
      if (!formData.EVENT_DESC.trim()) {
        throw new Error('請輸入事件詳細描述');
      }

      // Call the API to update the record
      await updatePrescriptionRecord(record, formData);
      
      // Create the updated record for the parent component
      const updatedRecord = {
        ...record,
        ...formData,
      };

      // Notify parent component of the successful update
      onSave(updatedRecord);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDiagnosisCodes = () => {
    if (!record.diseaseClasses || record.diseaseClasses.length === 0) {
      return '-';
    }
    return record.diseaseClasses
      .map(disease => `${disease.ICD} ${disease.CHT}`)
      .join('\n');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">編輯處方疑義紀錄</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
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

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                病歷號
              </label>
              <input
                type="text"
                value={record.PATCODE}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                醫生姓名
              </label>
              <input
                type="text"
                value={record.DOCTOR}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                科別
              </label>
              <input
                type="text"
                value={record.SECTNO}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                藥袋類型
              </label>
              <input
                type="text"
                value={record.BRYPE || '-'}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                操作者
              </label>
              <input
                type="text"
                value={record.OPERATOR}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                診斷碼
              </label>
              <textarea
                value={formatDiagnosisCodes()}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {/* Dynamic Error Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              錯誤類別 <span className="text-red-500">*</span>
            </label>
            
            {errorTypesError && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center text-sm">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {errorTypesError}
              </div>
            )}

            {loadingErrorTypes ? (
              <div className="border rounded-lg p-8 bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="medium" className="mr-3" />
                <span className="text-gray-600">載入錯誤類別選項中...</span>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {errorTypes.map((errorType) => (
                    <label key={errorType} className="flex items-center space-x-2 cursor-pointer hover:bg-white hover:shadow-sm rounded p-2 transition-colors">
                      <input
                        type="checkbox"
                        checked={isErrorTypeSelected(errorType)}
                        onChange={(e) => handleErrorTypeChange(errorType, e.target.checked)}
                        disabled={isSaving}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">{errorType}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Editable Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事件詳細描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.EVENT_DESC}
              onChange={(e) => setFormData({ ...formData, EVENT_DESC: e.target.value })}
              disabled={isSaving}
              rows={6}
              className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical disabled:opacity-50 disabled:bg-gray-100"
              placeholder="請輸入事件詳細描述..."
            />
          </div>

          {/* Editable Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備註
            </label>
            <textarea
              value={formData.REMARK}
              onChange={(e) => setFormData({ ...formData, REMARK: e.target.value })}
              disabled={isSaving}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical disabled:opacity-50 disabled:bg-gray-100"
              placeholder="請輸入備註..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.ERROR_TYPE_STRING.trim() || !formData.EVENT_DESC.trim() || loadingErrorTypes}
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
                儲存變更
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRecordModal;