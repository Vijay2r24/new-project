import { useState } from 'react';
import { useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const CustomDatePicker = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [internalValue, setInternalValue] = useState(value ? dayjs(value) : null);

  // Sync internalValue with value prop
  useEffect(() => {
    setInternalValue(value ? dayjs(value) : null);
  }, [value]);

  const handleChange = (newValue) => {
    const dateString = newValue ? newValue.format('YYYY-MM-DD') : '';
    setInternalValue(newValue);
    onChange(dateString);
  };

  return (
    <div className="w-48">
      {label && (
        <label
          className={`block text-sm font-medium mb-1 ${
            error ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={internalValue}
          onChange={handleChange}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
              size: 'small',
              InputProps: {
                sx: {
                  height: '38px', // Slightly shorter than before
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                  padding: '0 10px',
                  boxSizing: 'border-box',
                },
              },
              InputLabelProps: {
                shrink: true,
                sx: {
                  fontSize: '0.875rem',
                },
              },
              sx: {
                '& .MuiInputBase-root': {
                  height: '38px',
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                },
                '& input': {
                  height: '38px',
                  boxSizing: 'border-box',
                  padding: '6px 10px', // slightly smaller vertical padding
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: error ? '#d32f2f' : '#ccc',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5B45E0',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5B45E0',
                  borderWidth: 2,
                },
              },
              error: !!error,
              helperText: error,
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default CustomDatePicker;
