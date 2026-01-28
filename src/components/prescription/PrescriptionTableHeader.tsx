import React from 'react';
import { SortConfig, PrescriptionRecord } from '../../types/prescription';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PrescriptionTableHeaderProps {
  sortConfig: SortConfig;
  onSortChange: (key: keyof PrescriptionRecord) => void;
}

const PrescriptionTableHeader: React.FC<PrescriptionTableHeaderProps> = ({
  sortConfig,
  onSortChange,
}) => {
  const { t } = useLanguage();

  const getSortIcon = (key: keyof PrescriptionRecord) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'ascending' ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  const headerClass = "px-4 py-3 text-left text-base font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors duration-150 whitespace-nowrap";
  
  return (
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th 
          className={headerClass}
          onClick={() => onSortChange('PATCODE')}
        >
          <div className="flex items-center">
            {t('table.patientCode')}
            {getSortIcon('PATCODE')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('DOCTOR')}
        >
          <div className="flex items-center">
            {t('table.doctor')}
            {getSortIcon('DOCTOR')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('SECTNO')}
        >
          <div className="flex items-center">
            {t('table.department')}
            {getSortIcon('SECTNO')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('BRYPE')}
        >
          <div className="flex items-center">
            {t('table.prescriptionBagType')}
            {getSortIcon('BRYPE')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('ORDER_TIME')}
        >
          <div className="flex items-center">
            {t('table.orderTime')}
            {getSortIcon('ORDER_TIME')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('CREATE_TIME')}
        >
          <div className="flex items-center">
            {t('table.createTime')}
            {getSortIcon('CREATE_TIME')}
          </div>
        </th>
        <th 
          className={`${headerClass} w-48`}
          onClick={() => onSortChange('ERROR_TYPE_STRING')}
        >
          <div className="flex items-center">
            {t('table.errorType')}
            {getSortIcon('ERROR_TYPE_STRING')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('STATUS')}
        >
          <div className="flex items-center">
            {t('table.status')}
            {getSortIcon('STATUS')}
          </div>
        </th>
        <th 
          className={headerClass}
          onClick={() => onSortChange('OPERATOR')}
        >
          <div className="flex items-center">
            {t('table.operator')}
            {getSortIcon('OPERATOR')}
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default PrescriptionTableHeader;