import { forwardRef } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { DEFAULT_COUNTRY } from "../contants/constants";

const PhoneInputWithIcon = forwardRef(
  (
    {
      label,
      id,
      name,
      value,
      onChange,
      placeholder,
      error,
      Icon,
      inputSlot,
      defaultCountry = DEFAULT_COUNTRY,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>

        <div className="flex items-center border rounded-xl px-3 py-3 bg-white shadow-sm">
          {/* Phone Icon */}
          {Icon && <Icon className="h-5 w-5 text-gray-400 mr-2" />}

          {/* Phone Input with flag */}
          <PhoneInput
            ref={ref}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            defaultCountry={defaultCountry}
            international
            countryCallingCodeEditable={false}
            placeholder={placeholder}
            className="flex-1 border-none focus:ring-0 focus:outline-none"
            {...rest}
          />

          {/* Right slot if any */}
          {inputSlot && <div className="ml-2">{inputSlot}</div>}
        </div>

        {/* Validation Message */}
        {error ? (
          <p className="mt-1.5 text-sm text-red flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        ) : value && !isValidPhoneNumber(value) ? (
          <p className="mt-1.5 text-sm text-red flex items-center"></p>
        ) : null}
      </div>
    );
  }
);

export default PhoneInputWithIcon;
