import React, { useMemo, useState } from 'react';
import { PrescriptionRecord, SortConfig, FilterConfig } from '../../types/prescription';
import PrescriptionTableHeader from './PrescriptionTableHeader';
import PrescriptionTableRow from './PrescriptionTableRow';
import { useLanguage } from '../../contexts/LanguageContext';

interface PrescriptionTableProps {
  records: PrescriptionRecord[];
  sortConfig: SortConfig;
  onSortChange: (key: keyof PrescriptionRecord) => void;
  filter: FilterConfig;
  onRecordUpdate?: (updatedRecord: PrescriptionRecord) => void;
}

const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
  records,
  sortConfig,
  onSortChange,
  filter,
  onRecordUpdate,
}) => {
  const { t } = useLanguage();
  const [expandAll, setExpandAll] = useState(false);

  // Apply filtering and sorting
  const processedRecords = useMemo(() => {
    // Filter records based on search field and value
    let filteredRecords = records;
    
    if (filter.searchValue) {
      const searchValue = filter.searchValue.toLowerCase();
      filteredRecords = filteredRecords.filter(record => {
        switch (filter.searchField) {
          case 'patientCode':
            return record.PATCODE.toLowerCase().includes(searchValue);
          case 'department':
            return record.SECTNO.toLowerCase().includes(searchValue);
          case 'operator':
            return record.OPERATOR.toLowerCase().includes(searchValue);
          case 'reporter':
            return (record.REPORTER || '').toLowerCase().includes(searchValue);
          default:
            return record.PATCODE.toLowerCase().includes(searchValue);
        }
      });
    }
    
    // Sort records
    if (sortConfig.key) {
      filteredRecords = [...filteredRecords].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredRecords;
  }, [records, sortConfig, filter]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center mb-12">
        <p className="text-gray-500">{t('table.noRecords')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-12">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
        <div className="text-sm text-gray-600">
          {t('table.recordCount', { showing: processedRecords.length, total: records.length })}
        </div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={expandAll}
            onChange={(e) => setExpandAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">{t('table.showAll')}</span>
        </label>
      </div>
      <div className="overflow-x-auto relative">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <PrescriptionTableHeader 
              sortConfig={sortConfig} 
              onSortChange={onSortChange} 
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {processedRecords.map((record, index) => (
                <PrescriptionTableRow 
                  key={record.GUID} 
                  record={record} 
                  index={index}
                  isExpanded={expandAll}
                  onRecordUpdate={onRecordUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTable;