// components/EditableSection.jsx
import React from "react";
import { Pencil, X, Check } from "lucide-react";

const EditableSection = ({
  title,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        {/* Buttons */}
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border bg-white hover:bg-gray-100"
          >
            <Pencil size={16} />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border bg-white hover:bg-gray-100"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              onClick={onUpdate}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
            >
              <Check size={16} />
              Update
            </button>
          </div>
        )}
      </div>

      {/* Editable content */}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default EditableSection;
