
const SelectWithIcon = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  Icon,
  error,
  ...rest
}) => (
  <div className="w-full mt-4 md:mt-0">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {Icon && <Icon className="h-5 w-5 text-gray-400 group-hover:text-custom-bg transition-colors duration-200" />}
      </div>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-12 pr-4 py-3 border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-custom-bg focus:border-custom-bg transition-all duration-200 group-hover:border-custom-bg bg-white shadow-sm appearance-none`}
        {...rest}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  </div>
);

export default SelectWithIcon; 