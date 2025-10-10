import React from 'react';
import Datepicker from "react-tailwindcss-datepicker";
import { Calendar, X } from "lucide-react";
 
const CustomDatePicker = ({ value = { startDate: null, endDate: null }, onChange, label = "Date Range", ...rest }) => {
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

  return (
    <div className="relative overflow-visible">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative w-48 z-40">
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
            primaryColor="purple"
            popoverDirection="down"
            displayFormat="YYYY-MM-DD"
            containerClassName="relative w-full z-10"
            inputClassName={`block w-full ${hasValue ? 'pr-10' : 'pr-3'} pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm bg-white text-gray-900`}
            {...rest}
          />
        </div>
      </div>
    </div>
  );
};
 
export default CustomDatePicker;
