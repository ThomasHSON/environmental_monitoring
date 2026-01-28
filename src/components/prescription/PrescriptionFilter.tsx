import React from 'react';
import { FilterConfig, SearchField } from '../../types/prescription';
import { Search, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SearchButton from '../common/SearchButton';

interface PrescriptionFilterProps {
  filter: FilterConfig;
  setFilter: React.Dispatch<React.SetStateAction<FilterConfig>>;
  onSearch: () => void;
  isLoading?: boolean;
}

const PrescriptionFilter: React.FC<PrescriptionFilterProps> = ({ 
  filter, 
  setFilter, 
  onSearch,
  isLoading = false 
}) => {
  const { t } = useLanguage();

  const searchFieldOptions: { value: SearchField; label: string }[] = [
    { value: 'patientCode', label: t('search.field.patientCode') },
    { value: 'department', label: t('search.field.department') },
    { value: 'operator', label: t('search.field.operator') },
    { value: 'reporter', label: t('search.field.reporter') },
  ];

  const handleSearchFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSearchField = e.target.value as SearchField;
    setFilter({
      ...filter,
      searchField: newSearchField,
      searchValue: '', // Clear search value when changing field
    });
  };

  const handleSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      searchValue: e.target.value,
    });
  };

  const handleClear = () => {
    setFilter({
      ...filter,
      searchValue: '',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    }
  };

  const getPlaceholder = () => {
    switch (filter.searchField) {
      case 'patientCode':
        return t('search.placeholder.patientCode');
      case 'department':
        return t('search.placeholder.department');
      case 'operator':
        return t('search.placeholder.operator');
      case 'reporter':
        return t('search.placeholder.reporter');
      default:
        return t('search.placeholder.patientCode');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Field Dropdown */}
      <div className="relative">
        <select
          value={filter.searchField}
          onChange={handleSearchFieldChange}
          className="appearance-none w-40 border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-700 min-w-[120px]"
        >
          {searchFieldOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={filter.searchValue}
          onChange={handleSearchValueChange}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          className="pl-10 pr-10 py-2 border rounded-lg w-full md:w-64 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
        {filter.searchValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Button */}
      <SearchButton onClick={onSearch} isLoading={isLoading} />
    </div>
  );
};

export default PrescriptionFilter;