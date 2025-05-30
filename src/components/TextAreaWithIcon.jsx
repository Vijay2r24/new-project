
const TextAreaWithIcon = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  icon: Icon,
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 group-hover:text-custom-bg transition-colors duration-200" />
          </div>
        )}
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-bg focus:border-[#5B45E0] transition-all duration-200 group-hover:border-custom-bg bg-white shadow-sm min-h-[80px]"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default TextAreaWithIcon;
