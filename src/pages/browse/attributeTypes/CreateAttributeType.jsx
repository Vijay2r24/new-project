import React, { useState } from 'react';
import { ArrowLeft, Tag, Info, Settings, Hash,Edit, Trash, } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';

const CreateAttributeType = ({ setViewMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    dataType: '',
    validation: '',
    description: '',
    required: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Attribute type name is required';
    }
    if (!formData.dataType) {
      newErrors.dataType = 'Data type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
         onClick={() => setViewMode('list')}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
            <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Create Attribute Type</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
           <div className="w-full md:w-1/2">
          {/* Name */}
          <TextInputWithIcon
            label="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter attribute type name"
            error={errors.name}
            Icon={Tag}
          />
          </div>
           <div className="w-full md:w-1/2">
          {/* Data Type */}
          <SelectWithIcon
            label="Data Type"
            id="dataType"
            name="dataType"
            value={formData.dataType}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select a data type' },
              { value: 'string', label: 'String' },
              { value: 'number', label: 'Number' },
              { value: 'boolean', label: 'Boolean' },
              { value: 'date', label: 'Date' }
            ]}
            Icon={Settings}
            error={errors.dataType}
          />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Validation Rules */}
          <div className="w-full md:w-1/2">
            <label htmlFor="validation" className="block text-sm font-medium text-gray-700 mb-2">
              Validation Rules
            </label>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
              </div>
              <textarea
                id="validation"
                name="validation"
                value={formData.validation}
                onChange={handleInputChange}
                rows={3}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B45E0] focus:border-[#5B45E0] transition-all duration-200 group-hover:border-[#5B45E0] bg-white shadow-sm resize-none"
                placeholder="Enter validation rules (JSON format)"
              />
              <p className="mt-1.5 text-sm text-gray-500">
                Enter validation rules in JSON format (e.g., {'{min: 0, max: 100}'})
              </p>
            </div>
          </div>
          {/* Description */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Info className="h-5 w-5 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B45E0] focus:border-[#5B45E0] transition-all duration-200 group-hover:border-[#5B45E0] bg-white shadow-sm resize-none"
                placeholder="Enter attribute type description"
              />
            </div>
          </div>
        </div>
        {/* Required Checkbox and Form Actions remain full width */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="required"
              name="required"
              type="checkbox"
              checked={formData.required}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#5B45E0] border-gray-300 rounded focus:ring-[#5B45E0]"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="required" className="font-medium text-gray-700">
              Required
            </label>
            <p className="text-gray-500">Make this attribute type required for all products</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
           onClick={() => setViewMode('list')}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-secondry"
          >
            Create Attribute Type
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeType; 