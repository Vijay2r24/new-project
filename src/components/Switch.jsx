import React from "react";
import { STATUS, TOOLTIPSTATUS } from "../contants/constants";

const Switch = ({ checked, onChange, label = "", ...props }) => (
  <label className="relative inline-flex items-center cursor-pointer group">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
      {...props}
    />
    <div className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 relative">
     
        <span className="absolute top-1/2 left-[120%] -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {checked ? TOOLTIPSTATUS.ACTIVE: TOOLTIPSTATUS.INACTIVE}
      </span>
    </div>

    {label && (
      <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
    )}
  </label>
);      

export default Switch;
