import React, { useState, useEffect } from 'react';
import { PrescriptionRecord } from '../../types/prescription';
import { formatDateTime } from '../../utils/dateUtils';
import { ChevronDown, ChevronUp, Download, Edit, CheckCircle } from 'lucide-react';
import { downloadSingleRecord, confirmPrescriptionReport } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EditRecordModal from './EditRecordModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface PrescriptionTableRowProps {
  record: PrescriptionRecord;
  index: number;
  isExpanded?: boolean;
  onRecordUpdate?: (updatedRecord: PrescriptionRecord) => void;
}

const PrescriptionTableRow: React.FC<PrescriptionTableRowProps> = ({
  record,
  index,
  isExpanded = false,
  onRecordUpdate,
}) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(isExpanded);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;

    setDownloading(true);
    setError(null);

    try {
      await downloadSingleRecord(record.GUID);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.api'));
    } finally {
      setDownloading(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only allow edit if status is "未更改"
    if (record.STATUS === '未更改') {
      setIsEditModalOpen(true);
    }
  };

  const handleConfirmReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleConfirmReportSubmit = async () => {
    setIsConfirming(true);
    setError(null);
    setShowConfirmDialog(false);

    try {
      // Call the API to confirm the report
      await confirmPrescriptionReport(record);
      
      // Get current user from session storage for the updated record
      const userSession = sessionStorage.getItem('user_session');
      let reporterName = '';
      
      if (userSession) {
        try {
          const userData = JSON.parse(userSession);
          reporterName = userData.Name || '';
        } catch (error) {
          console.error('Failed to parse user session:', error);
        }
      }

      // Create current timestamp
      const now = new Date();
      const reportTime = now.toISOString().slice(0, 19).replace('T', ' ');

      // Create the updated record for the parent component
      const updatedRecord = {
        ...record,
        STATUS: '確認提報',
        REPORTER: reporterName,
        REPORT_TIME: reportTime,
      };

      // Notify parent component of the successful update
      if (onRecordUpdate) {
        onRecordUpdate(updatedRecord);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '確認提報失敗，請稍後再試');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSaveRecord = (updatedRecord: PrescriptionRecord) => {
    // Call the parent component's update handler
    if (onRecordUpdate) {
      onRecordUpdate(updatedRecord);
    }
    
    console.log('Record updated successfully:', updatedRecord);
  };

  // Function to format error types with line breaks
  const formatErrorTypes = (errorTypeString: string) => {
    if (!errorTypeString) return '-';
    
    // Split by semicolon and trim whitespace
    const errorTypes = errorTypeString.split(';').map(type => type.trim()).filter(type => type);
    
    return errorTypes.map((errorType, index) => (
      <div key={index} className="text-xs font-medium text-red-800 leading-relaxed">
        {errorType}
      </div>
    ));
  };

  // Check if record can be edited (only if status is "未更改")
  const canEdit = record.STATUS === '未更改';
  
  // Check if confirm report button should be shown (only if status is "未更改")
  const canConfirmReport = record.STATUS === '未更改';
  
  const rowClass = index % 2 === 0 
    ? "bg-white hover:bg-blue-50 transition-colors duration-150" 
    : "bg-gray-50 hover:bg-blue-50 transition-colors duration-150";
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case t('status.processed'):
        return 'text-green-600 bg-green-100 border-green-200';
      case t('status.processing'):
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case t('status.unchanged'):
        return 'text-amber-600 bg-amber-100 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };
  
  const statusClass = `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.STATUS)}`;

  return (
    <>
      <tr className={`${rowClass} cursor-pointer`} onClick={toggleExpand}>
        <td className="px-4 py-3 whitespace-nowrap">{record.PATCODE}</td>
        <td className="px-4 py-3 whitespace-nowrap min-w-[120px]">{record.DOCTOR}</td>
        <td className="px-4 py-3 whitespace-nowrap">{record.SECTNO}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="inline-flex rounded-md px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
            {record.BRYPE || '-'}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(record.ORDER_TIME)}</td>
        <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(record.CREATE_TIME)}</td>
        <td className="px-4 py-3 w-48">
          <div className="bg-red-100 rounded-md px-2 py-1 min-h-[28px] flex flex-col justify-center">
            {formatErrorTypes(record.ERROR_TYPE_STRING)}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={statusClass}>{record.STATUS}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">{record.OPERATOR}</td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50 animate-fadeIn">
          <td colSpan={9} className="px-6 py-4">
            <div className="text-base text-gray-800">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-lg">{t('table.details')}</h4>
                <div className="flex items-center space-x-3">
                  {/* Edit button - only show if status is "未更改" */}
                  {canEdit && (
                    <button
                      onClick={handleEditClick}
                      className="flex items-center px-3 py-2 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                      title="編輯紀錄"
                    >
                      <Edit size={16} className="mr-2" />
                      編輯
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                    title={t('download')}
                  >
                    {downloading ? (
                      <LoadingSpinner size="small" className="mr-2" />
                    ) : (
                      <Download size={16} className="mr-2" />
                    )}
                    {t('download')}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Diagnosis Section */}
              {record.diseaseClasses && record.diseaseClasses.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-base font-medium text-gray-700 mb-3">{t('table.diagnosis')}</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {record.diseaseClasses.map((disease, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <span className="font-mono text-sm text-blue-600 font-medium min-w-[80px]">
                            {disease.ICD}
                          </span>
                          <span className="text-gray-800 flex-1">
                            {disease.CHT}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Event Description Section */}
              <div className="mb-4">
                <h5 className="text-base font-medium text-gray-700 mb-3">{t('table.details')}</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-line text-gray-800">{record.EVENT_DESC}</p>
                </div>
              </div>
              
              {/* Bottom section with Reporter, Report Time, Remarks, and Confirm Report Button */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">          
                <div>
                  <h5 className="text-base font-medium text-gray-700">{t('table.reporter')}</h5>
                  <p>{record.REPORTER || '-'}</p>
                </div>
                <div>
                  <h5 className="text-base font-medium text-gray-700">{t('table.reportTime')}</h5>
                  <p>{formatDateTime(record.REPORT_TIME)}</p>
                </div>
                <div>
                  <h5 className="text-base font-medium text-gray-700">{t('table.remarks')}</h5>
                  <p>{record.REMARK || '-'}</p>
                </div>
                {/* Confirm Report button - only show if status is "未更改" */}
                {canConfirmReport && (
                  <div className="flex justify-end items-start">
                    <button
                      onClick={handleConfirmReport}
                      disabled={isConfirming}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirming ? (
                        <>
                          <LoadingSpinner size="small" className="mr-2" />
                          確認中...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          確認提報
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Edit Modal - only render if canEdit is true */}
      {canEdit && (
        <EditRecordModal
          record={record}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveRecord}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle size={24} className="text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">確認提報</h3>
              </div>
              <p className="text-gray-600 mb-6">
                您確定要提交此報告嗎？
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmReportSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionTableRow;