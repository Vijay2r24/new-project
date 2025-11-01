import React from 'react';
import Datepicker from "react-tailwindcss-datepicker";
import { Calendar, X } from "lucide-react";
import { DATE_PICKER_CONFIG, SHORTCUT_LABELS, TIME_PERIODS } from '../contants/constants';

const CustomDatePicker = ({ value = { startDate: null, endDate: null }, onChange, label = "", ...rest }) => {
  const handleClear = () => {
    const clearedValue = { startDate: null, endDate: null };
    onChange?.(clearedValue);
  };

  const handleDateChange = (newValue) => {
    // Ensure we pass the dates in the correct format
    const formattedValue = {
      startDate: newValue?.startDate || null,
      endDate: newValue?.endDate || null
    };
    onChange?.(formattedValue);
  };

  const hasValue = value?.startDate || value?.endDate;

  // Ensure the value passed to Datepicker is always in the correct format
  const datePickerValue = {
    startDate: value?.startDate || null,
    endDate: value?.endDate || null
  };

  // Custom shortcuts including time-based ones
  const customShortcuts = {
  today: {
    text: SHORTCUT_LABELS.TODAY,
    period: {
      start: new Date(),
      end: new Date()
    }
  },
  yesterday: {
    text: SHORTCUT_LABELS.YESTERDAY,
    period: {
      start: new Date(new Date().setDate(new Date().getDate() + TIME_PERIODS.DAYS.YESTERDAY)),
      end: new Date(new Date().setDate(new Date().getDate() + TIME_PERIODS.DAYS.YESTERDAY))
    }
  },
  last7Days: {
    text: SHORTCUT_LABELS.LAST_7_DAYS,
    period: {
      start: new Date(new Date().setDate(new Date().getDate() + TIME_PERIODS.DAYS.LAST_7_DAYS)),
      end: new Date()
    }
  },
  last30Days: {
    text: SHORTCUT_LABELS.LAST_30_DAYS,
    period: {
      start: new Date(new Date().setDate(new Date().getDate() + TIME_PERIODS.DAYS.LAST_30_DAYS)),
      end: new Date()
    }
  },
  lastHour: {
    text: SHORTCUT_LABELS.LAST_HOUR,
    period: {
      start: new Date(new Date().setHours(new Date().getHours() + TIME_PERIODS.HOURS.LAST_HOUR)),
      end: new Date()
    }
  },
  last2Hours: {
    text: SHORTCUT_LABELS.LAST_2_HOURS,
    period: {
      start: new Date(new Date().setHours(new Date().getHours() + TIME_PERIODS.HOURS.LAST_2_HOURS)),
      end: new Date()
    }
  },
  last3Hours: {
    text: SHORTCUT_LABELS.LAST_3_HOURS,
    period: {
      start: new Date(new Date().setHours(new Date().getHours() + TIME_PERIODS.HOURS.LAST_3_HOURS)),
      end: new Date()
    }
  },
  last6Hours: {
    text: SHORTCUT_LABELS.LAST_6_HOURS,
    period: {
      start: new Date(new Date().setHours(new Date().getHours() + TIME_PERIODS.HOURS.LAST_6_HOURS)),
      end: new Date()
    }
  },
  last12Hours: {
    text: SHORTCUT_LABELS.LAST_12_HOURS,
    period: {
      start: new Date(new Date().setHours(new Date().getHours() + TIME_PERIODS.HOURS.LAST_12_HOURS)),
      end: new Date()
    }
  },
  last24Hours: {
    text: SHORTCUT_LABELS.LAST_24_HOURS,
    period: {
      start: new Date(new Date().setHours(new Date().getHours() + TIME_PERIODS.HOURS.LAST_24_HOURS)),
      end: new Date()
    }
  }
};

  return (
    <div className="relative overflow-visible z-0">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full z-40">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
        {hasValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-20 hover:bg-gray-100 rounded-r-lg transition-colors"
            type="button"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        <div className="[&_svg]:hidden">
          <Datepicker
            value={datePickerValue}
            onChange={handleDateChange}
            useRange={true}
            asSingle={false}
            showShortcuts={true}
            primaryColor={DATE_PICKER_CONFIG.PRIMARY_COLOR}
            popoverDirection={DATE_PICKER_CONFIG.POPOVER_DIRECTION}
            displayFormat={DATE_PICKER_CONFIG.DISPLAY_FORMAT}
            containerClassName="relative w-full z-0"
            popoverClassName="z-0"
            inputClassName={`block w-full ${hasValue ? 'pr-10' : 'pr-3'} pl-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm bg-white text-gray-900 placeholder-gray-400`}
            configs={{
              shortcuts: customShortcuts
            }}
            {...rest}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomDatePicker;