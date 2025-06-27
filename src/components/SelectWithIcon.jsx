import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';

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
  ...rest
}, ref) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sSearchTerm, setSearchTerm] = useState('');
  const [nHighlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const optionsRef = useRef(null);
  const portalDropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const selectedOptionLabels = Array.isArray(value)
    ? options.filter(option => value.includes(option.value)).map(option => option.label)
    : [options.find(option => option.value === value)?.label || placeholder];

  const displayLabel = (multiple && Array.isArray(value) && value.length === 0)
    ? placeholder
    : selectedOptionLabels[0];

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(sSearchTerm.toLowerCase())
  );

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

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

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

  const handleRemoveSelectedItem = (itemValue) => {
    if (!multiple || !Array.isArray(value)) return;
    const newValue = value.filter(val => val !== itemValue);
    const event = { target: { name, value: newValue } };
    onChange(event);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (nHighlightedIndex !== -1 && filteredOptions[nHighlightedIndex]) {
        handleSelect(filteredOptions[nHighlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      selectRef.current.focus();
    }
  };

  const handleClickOutside = (event) => {
    const portalDropdown = portalDropdownRef.current;
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target) &&
      (!portalDropdown || !portalDropdown.contains(event.target))
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
    <div className="w-full mt-4 md:mt-0" ref={selectRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group">
        <div
          ref={ref}
          className={`relative w-full pl-12 pr-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-custom-bg focus:border-custom-bg transition-all duration-200 group-hover:border-custom-bg bg-white shadow-sm cursor-pointer flex items-center justify-between ${multiple && value.length > 0 ? 'h-auto min-h-[46px] items-start py-2' : 'h-[46px]'}`}
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
          <div className="flex flex-wrap gap-2 w-full pr-8">
            {multiple && Array.isArray(value) && value.length > 0 ? (
              value.map(itemValue => {
                const itemLabel = options.find(option => option.value === itemValue)?.label;
                return itemLabel ? (
                  <span
                    key={itemValue}
                    className="flex items-center bg-custom-bg text-white text-xs font-medium px-2.5 py-0.5 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelectedItem(itemValue);
                    }}
                  >
                    {itemLabel}
                    <X className="ml-1 h-3 w-3 cursor-pointer" />
                  </span>
                ) : null;
              })
            ) : (
              <span className={`block truncate w-full text-left ${displayLabel === placeholder ? 'text-gray-500' : 'text-gray-900'}`}>
                {displayLabel}
              </span>
            )}
          </div>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        {isOpen && typeof window !== 'undefined' && document.getElementById('portal-root') && ReactDOM.createPortal(
          <div ref={portalDropdownRef} style={dropdownStyle} className="rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto focus:outline-none">
            <div className="px-4 py-2">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('select.searchPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-custom-bg focus:border-custom-bg"
                  value={sSearchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-4 text-gray-500">{t('select.loading')}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">{t('select.noOptions')}</div>
            ) : (
              <ul tabIndex="-1" role="listbox" className="py-1" ref={optionsRef}>
                {filteredOptions.map((opt, index) => (
                  <li
                    key={opt.value}
                    className={`cursor-default select-none relative py-2 pl-12 pr-4 ${index === nHighlightedIndex ? 'bg-custom-bg text-white' : 'text-gray-900'} ${multiple && Array.isArray(value) && value.includes(opt.value) ? 'bg-blue-100 text-blue-800' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={index === nHighlightedIndex || (multiple && Array.isArray(value) && value.includes(opt.value))}
                  >
                    <span className="block truncate">{opt.label}</span>
                    {multiple && Array.isArray(value) && value.includes(opt.value) && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.getElementById('portal-root')
        )}
      </div>
    </div>
  );
});

export default SelectWithIcon; 