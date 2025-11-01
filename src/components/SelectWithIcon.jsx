import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SelectWithIcon = forwardRef(({
  label,
  id,
  name,
  value,
  onChange,
  options,
  Icon,
  error,
  placeholder,
  loading,
  multiple = false,
  maxVisibleItems = 3, // Maximum number of items to show before adding ellipsis
  ...rest
}, ref) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sSearchTerm, setSearchTerm] = useState('');
  const [nHighlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const optionsRef = useRef(null);
  const selectedItemsRef = useRef(null);

  const selectedOptionLabels = Array.isArray(value)
    ? options.filter(option => value.includes(option.value)).map(option => option.label)
    : [options.find(option => option.value === value)?.label || placeholder];

  const displayLabel = (multiple && Array.isArray(value) && value.length === 0)
    ? placeholder
    : selectedOptionLabels[0];

  const filteredOptions = options.filter(option =>
    typeof option.label === 'string' &&
    option.label.toLowerCase().includes(sSearchTerm.toLowerCase())
  );

  // Check if select all should be shown
  const shouldShowSelectAll = multiple && filteredOptions.length > 2;
  
  // Check if all options are selected
  const allSelected = multiple && Array.isArray(value) && 
    filteredOptions.length > 0 && 
    filteredOptions.every(option => value.includes(option.value));

  // Calculate visible items and remaining count
  const visibleItems = multiple && Array.isArray(value) 
    ? value.slice(0, maxVisibleItems)
    : [];
  const remainingCount = multiple && Array.isArray(value) 
    ? Math.max(0, value.length - maxVisibleItems)
    : 0;

  // Handle select all
  const handleSelectAll = () => {
    if (!multiple) return;
    
    const allValues = filteredOptions.map(option => option.value);
    const newValue = allSelected ? [] : allValues;
    const event = { target: { name, value: newValue } };
    onChange(event);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && nHighlightedIndex !== -1 && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[nHighlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [nHighlightedIndex, isOpen]);

  const handleSelect = (optionValue) => {
    let newValue;
    if (multiple) {
      newValue = Array.isArray(value)
        ? value.includes(optionValue)
          ? value.filter(val => val !== optionValue)
          : [...value, optionValue]
        : [optionValue];
    } else {
      newValue = optionValue;
      setIsOpen(false);
    }
    const event = { target: { name, value: newValue } };
    onChange(event);
    setSearchTerm('');
  };

  const handleRemoveSelectedItem = (itemValue, e) => {
    e.stopPropagation();
    if (!multiple || !Array.isArray(value)) return;
    const newValue = value.filter(val => val !== itemValue);
    const event = { target: { name, value: newValue } };
    onChange(event);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const startIndex = shouldShowSelectAll ? -1 : 0;
      setHighlightedIndex(prev => {
        if (prev === -1) return startIndex;
        return (prev + 1) % (filteredOptions.length + (shouldShowSelectAll ? 1 : 0));
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const totalItems = filteredOptions.length + (shouldShowSelectAll ? 1 : 0);
      setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (nHighlightedIndex === -1 && shouldShowSelectAll) {
        handleSelectAll();
      } else if (nHighlightedIndex !== -1 && filteredOptions[nHighlightedIndex - (shouldShowSelectAll ? 1 : 0)]) {
        handleSelect(filteredOptions[nHighlightedIndex - (shouldShowSelectAll ? 1 : 0)].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      selectRef.current.focus();
    }
  };

  const handleClickOutside = (event) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full mt-4 md:mt-0">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group" ref={selectRef}>
        <div
          ref={ref}
          className={`relative w-full pl-12 pr-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-custom-bg focus:border-custom-bg transition-all duration-200 group-hover:border-custom-bg bg-white shadow-sm cursor-pointer flex items-center justify-between ${multiple && value.length > 0 ? 'h-auto min-h-[46px]' : 'h-[46px]'}`}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          {...rest}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-1">
            {Icon && <Icon className="h-5 w-5 text-gray-400 group-hover:text-custom-bg transition-colors duration-200" />}
          </div>
          
          {/* Selected Items Area */}
          <div 
            ref={selectedItemsRef}
            className={`flex flex-wrap gap-2 w-full pr-8 overflow-hidden ${multiple && value.length > maxVisibleItems ? 'max-h-12 overflow-y-auto' : ''}`}
          >
            {multiple && Array.isArray(value) && value.length > 0 ? (
              <>
                {/* Visible selected items */}
                {visibleItems.map(itemValue => {
                  const itemLabel = options.find(option => option.value === itemValue)?.label;
                  return itemLabel ? (
                    <span
                      key={itemValue}
                      className="flex items-center bg-custom-bg text-white text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                      onClick={(e) => handleRemoveSelectedItem(itemValue, e)}
                    >
                      {itemLabel}
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </span>
                  ) : null;
                })}
                
                {/* Ellipsis for remaining items */}
                {remainingCount > 0 && (
                  <span className="flex items-center bg-gray-300 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0">
                    +{remainingCount} more
                  </span>
                )}
              </>
            ) : (
              <span className={`block truncate w-full text-left ${displayLabel === placeholder ? 'text-gray-500' : 'text-gray-900'}`}>
                {displayLabel}
              </span>
            )}
          </div>
          
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-red flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto z-50">
            <div className="px-4 py-2">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('SELECT.SEARCH_PLACEHOLDER')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-custom-bg focus:border-custom-bg"
                  value={sSearchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                    if (typeof rest.onInputChange === 'function') {
                      rest.onInputChange(e.target.value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
                {sSearchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      inputRef.current.focus();
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-caption"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-4 text-gray-500">{t('COMMON.LOADING_SIMPLE')}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">{t('COMMON.NO_OPTIONS_FOUND')}</div>
            ) : (
              <ul tabIndex="-1" role="listbox" className="py-1" ref={optionsRef}>
                {/* Select All Button - Only for multiple selection */}
                {shouldShowSelectAll && (
                  <li
                    className={`cursor-default select-none relative py-2 pl-4 pr-4 ${nHighlightedIndex === -1 ? 'bg-custom-bg text-white' : 'text-gray-900'} border-b border-gray-100`}
                    onClick={handleSelectAll}
                    onMouseEnter={() => setHighlightedIndex(-1)}
                    role="option"
                    aria-selected={allSelected}
                  >
                    <div className="flex items-center">
                      <span className="block truncate font-medium">
                        {allSelected ? t('COMMON.DESELECT_ALL') : t('COMMON.SELECT_ALL')}
                      </span>
                      {allSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </li>
                )}
                
                {/* Options */}
                {filteredOptions.map((opt, index) => {
                  const displayIndex = index + (shouldShowSelectAll ? 1 : 0);
                  const isSelected = multiple 
                    ? Array.isArray(value) && value.includes(opt.value)
                    : value === opt.value;
                  const isHighlighted = displayIndex === nHighlightedIndex;
                  
                  return (
                    <li
                      key={opt.value}
                      className={`cursor-default select-none relative py-2 ${multiple ? 'pl-12 pr-4' : 'pl-4 pr-4'} ${isHighlighted ? 'bg-custom-bg text-white' : 'text-gray-900'} ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(displayIndex)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center">
                        {/* Checkbox - Only for multiple selection */}
                        {multiple && (
                          <div className="absolute left-0 flex items-center pl-3">
                            <div className={`flex items-center justify-center w-4 h-4 border rounded ${isSelected ? 'bg-custom-bg border-custom-bg' : 'border-gray-300'} ${isHighlighted ? 'border-white' : ''}`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                        <span className="block truncate">{opt.label}</span>
                        
                        {/* Checkmark for single selection */}
                        {!multiple && isSelected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default SelectWithIcon;