import React from 'react';
import { useTranslation } from 'react-i18next';

const FloatingFooter = ({ 
  onCancel, 
  onSubmit, 
  isSubmitting = false, 
  isEditMode = false,
  cancelLabel,
  submitLabel,
  submitDisabled = false,
  cancelDisabled = false,
  showCancel = true,
  showSubmit = true,
  customButtons,
  className = "",
  align = "end" // "start", "center", "end", "between"
}) => {
  const { t } = useTranslation();

  const defaultCancelLabel = cancelLabel || t("COMMON.CANCEL");
  const defaultSubmitLabel = submitLabel || 
    (isSubmitting 
      ? t("COMMON.SAVING") 
      : isEditMode 
        ? t("COMMON.UPDATE") 
        : t("COMMON.CREATE")
    );

  const alignmentClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between"
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-2 z-30 ${className}`}>
      <div className="max-w-8xl mx-auto px-4 lg:px-8">
        <div className={`flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 ${alignmentClasses[align]}`}>
          {/* Custom buttons if provided */}
          {customButtons}
          
          {/* Cancel button */}
          {showCancel && (
            <button
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded shadow w-full sm:w-auto truncate transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onCancel}
              type="button"
              disabled={isSubmitting || cancelDisabled}
            >
              {defaultCancelLabel}
            </button>
          )}
          
          {/* Submit button */}
          {showSubmit && (
            <button
              className="btn-primary truncate w-full sm:w-auto px-3 py-1.5 text-sm hover:bg-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={isSubmitting || submitDisabled}
              onClick={onSubmit}
            >
              {defaultSubmitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingFooter;