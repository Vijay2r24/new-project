import { forwardRef } from 'react';

const TextInputWithIcon = forwardRef(({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  Icon,
  inputSlot,
  ...rest
}, ref) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon className="h-5 w-5 text-gray-400 group-hover:text-custom-bg transition-colors duration-200" />}
        </div>
        <input
          ref={ref}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
         className={`block w-full pl-12 pr-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-custom-bg transition-all duration-200 group-hover:border-custom-bg bg-white shadow-sm appearance-none`}
          {...rest}
        />
        {inputSlot && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {inputSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
});

export default TextInputWithIcon; 