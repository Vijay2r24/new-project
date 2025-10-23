import React, { useEffect } from "react";
import CustomDatePicker from "./CustomDatePicker";
import { DOWNLOAD_ICON } from "../contants/constants";

const ExportPanel = ({
  title = "Date Range",
  value,
  onChange,
  onCancel,
  onConfirm,
  confirmLabel = "Download",
}) => {
  useEffect(() => {
    if (
      document.activeElement &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  }, []);
  return (
    <div className="absolute right-6 top-[118px] z-50 w-[24rem] max-w-[90vw] bg-white border border-gray-200 shadow-xl rounded-2xl p-5">
      <CustomDatePicker
        label={"Date Range"}
        value={value}
        onChange={onChange}
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-custom-bg text-white hover:bg-bg-hover"
        >
          {DOWNLOAD_ICON}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;
