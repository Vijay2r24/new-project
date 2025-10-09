import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CustomDatePicker = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  useRange = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || '');
  const [selectedRange, setSelectedRange] = useState(value || { startDate: null, endDate: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const datePickerRef = useRef(null);

  // Sync selectedDate with value prop
  useEffect(() => {
    if (useRange) {
      setSelectedRange(value || { startDate: null, endDate: null });
    } else {
      setSelectedDate(value || '');
    }
  }, [value, useRange]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRangeDisplay = () => {
    if (!selectedRange.startDate && !selectedRange.endDate) return '';
    if (selectedRange.startDate && selectedRange.endDate) {
      return `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}`;
    }
    if (selectedRange.startDate) {
      return `${formatDate(selectedRange.startDate)} - ...`;
    }
    return '';
  };

  const handleDateSelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = new Date(year, month, day);
    const dateString = selectedDate.toISOString().split('T')[0];
    
    if (useRange) {
      if (!selectedRange.startDate || (selectedRange.startDate && selectedRange.endDate)) {
        // Start new range
        const newRange = { startDate: dateString, endDate: null };
        setSelectedRange(newRange);
        onChange(newRange);
      } else if (selectedRange.startDate && !selectedRange.endDate) {
        // Complete the range
        const startDate = new Date(selectedRange.startDate);
        const endDate = new Date(dateString);
        
        if (endDate < startDate) {
          // Swap dates if end is before start
          const newRange = { startDate: dateString, endDate: selectedRange.startDate };
          setSelectedRange(newRange);
          onChange(newRange);
        } else {
          const newRange = { startDate: selectedRange.startDate, endDate: dateString };
          setSelectedRange(newRange);
          onChange(newRange);
        }
        setIsOpen(false);
      }
    } else {
      setSelectedDate(dateString);
    onChange(dateString);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const isSelected = (day) => {
    if (useRange) {
      if (!selectedRange.startDate) return false;
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const dayDate = new Date(year, month, day);
      const dayString = dayDate.toISOString().split('T')[0];
      
      return dayString === selectedRange.startDate || dayString === selectedRange.endDate;
    } else {
      if (!selectedDate) return false;
      const selected = new Date(selectedDate);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      return selected.getDate() === day && 
             selected.getMonth() === month && 
             selected.getFullYear() === year;
    }
  };

  const isInRange = (day) => {
    if (!useRange || !selectedRange.startDate || !selectedRange.endDate) return false;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dayDate = new Date(year, month, day);
    const dayString = dayDate.toISOString().split('T')[0];
    
    const startDate = new Date(selectedRange.startDate);
    const endDate = new Date(selectedRange.endDate);
    
    return dayDate >= startDate && dayDate <= endDate;
  };

  const isHoveredInRange = (day) => {
    if (!useRange || !selectedRange.startDate || selectedRange.endDate) return false;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dayDate = new Date(year, month, day);
    const dayString = dayDate.toISOString().split('T')[0];
    
    const startDate = new Date(selectedRange.startDate);
    const hoverDate = hoveredDate ? new Date(hoveredDate) : null;
    
    if (!hoverDate) return false;
    
    const minDate = startDate < hoverDate ? startDate : hoverDate;
    const maxDate = startDate > hoverDate ? startDate : hoverDate;
    
    return dayDate >= minDate && dayDate <= maxDate;
  };

  const handleShortcut = (type) => {
    const today = new Date();
    let newValue;

    switch (type) {
      case 'today':
        newValue = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        newValue = yesterday.toISOString().split('T')[0];
        break;
      case 'past7':
        const past7 = new Date(today);
        past7.setDate(today.getDate() - 7);
        newValue = useRange 
          ? { startDate: past7.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] }
          : past7.toISOString().split('T')[0];
        break;
      case 'past30':
        const past30 = new Date(today);
        past30.setDate(today.getDate() - 30);
        newValue = useRange 
          ? { startDate: past30.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] }
          : past30.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    if (useRange) {
      setSelectedRange(newValue);
      onChange(newValue);
    } else {
      setSelectedDate(newValue);
      onChange(newValue);
    }
    setIsOpen(false);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    t('DATE_PICKER.MONTHS.JANUARY'), t('DATE_PICKER.MONTHS.FEBRUARY'), t('DATE_PICKER.MONTHS.MARCH'), t('DATE_PICKER.MONTHS.APRIL'), 
    t('DATE_PICKER.MONTHS.MAY'), t('DATE_PICKER.MONTHS.JUNE'), t('DATE_PICKER.MONTHS.JULY'), t('DATE_PICKER.MONTHS.AUGUST'), 
    t('DATE_PICKER.MONTHS.SEPTEMBER'), t('DATE_PICKER.MONTHS.OCTOBER'), t('DATE_PICKER.MONTHS.NOVEMBER'), t('DATE_PICKER.MONTHS.DECEMBER')
  ];
  const dayNames = [
    t('DATE_PICKER.DAYS.SUN'), t('DATE_PICKER.DAYS.MON'), t('DATE_PICKER.DAYS.TUE'), t('DATE_PICKER.DAYS.WED'), 
    t('DATE_PICKER.DAYS.THU'), t('DATE_PICKER.DAYS.FRI'), t('DATE_PICKER.DAYS.SAT')
  ];

  return (
    <div className="w-48 relative" ref={datePickerRef}>
      {label && (
        <label
          className={`block text-sm font-medium mb-1 ${
            error ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={useRange ? formatRangeDisplay() : formatDate(selectedDate)}
          placeholder={placeholder || t('DATE_PICKER.SELECT_DATE')}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 text-sm border rounded-lg cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${error 
              ? 'border-red-300 bg-red-50 text-red-900' 
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
              : 'hover:border-gray-400'
            }
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Shortcuts */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleShortcut('today')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {t('DATE_PICKER.TODAY')}
              </button>
              <button
                onClick={() => handleShortcut('yesterday')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {t('DATE_PICKER.YESTERDAY')}
              </button>
              <button
                onClick={() => handleShortcut('past7')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {t('DATE_PICKER.PAST_7_DAYS')}
              </button>
              <button
                onClick={() => handleShortcut('past30')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {t('DATE_PICKER.PAST_30_DAYS')}
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-sm font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {dayNames.map(day => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                onMouseEnter={() => day && setHoveredDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0])}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={!day}
                className={`
                  h-8 w-8 text-xs rounded-full transition-colors duration-200 relative
                  ${!day 
                    ? 'cursor-default' 
                    : 'hover:bg-blue-100 cursor-pointer'
                  }
                  ${day && isToday(day) 
                    ? 'bg-blue-500 text-white font-semibold' 
                    : ''
                  }
                  ${day && isSelected(day) && !isToday(day)
                    ? 'bg-blue-600 text-white font-semibold'
                    : ''
                  }
                  ${day && isInRange(day) && !isSelected(day)
                    ? 'bg-blue-100 text-blue-700'
                    : ''
                  }
                  ${day && isHoveredInRange(day) && !isInRange(day)
                    ? 'bg-blue-50 text-blue-600'
                    : ''
                  }
                  ${day && !isToday(day) && !isSelected(day) && !isInRange(day) && !isHoveredInRange(day)
                    ? 'text-gray-700 hover:bg-blue-100'
                    : ''
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-3 border-t border-gray-200">
            <button
              onClick={() => {
                if (useRange) {
                  const today = new Date();
                  const todayString = today.toISOString().split('T')[0];
                  const newRange = { startDate: todayString, endDate: null };
                  setSelectedRange(newRange);
                  onChange(newRange);
                } else {
                  const today = new Date();
                  const todayString = today.toISOString().split('T')[0];
                  setSelectedDate(todayString);
                  onChange(todayString);
                }
                setIsOpen(false);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('DATE_PICKER.TODAY')}
            </button>
            
            <button
              onClick={() => {
                if (useRange) {
                  const newRange = { startDate: null, endDate: null };
                  setSelectedRange(newRange);
                  onChange(newRange);
                } else {
                  setSelectedDate('');
                  onChange('');
                }
                setIsOpen(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {t('DATE_PICKER.CLEAR')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
