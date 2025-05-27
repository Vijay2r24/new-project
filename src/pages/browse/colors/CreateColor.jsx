import React, { useState } from 'react';
import { ArrowLeft, Tag, Info, Palette, ArrowRight } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';

const CreateColor = ({ setViewMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    hexCode: '#000000',
    status: 'active',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      newErrors.name = 'Color name is required';
    }
    if (!formData.hexCode) {
      newErrors.hexCode = 'Color code is required';
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
        <h2 className="text-xl font-bold text-gray-900">Create Color</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Color Name */}
        <div className="w-full md:w-1/2">
          <TextInputWithIcon
            label="Color Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter color name"
            error={errors.name}
            Icon={Tag}
          />
          </div>
          {/* Color Code */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <TextInputWithIcon
              label="Color Code"
              id="hexCode"
              name="hexCode"
              value={formData.hexCode}
              onChange={handleInputChange}
              placeholder="#000000"
              error={errors.hexCode}
              Icon={Palette}
              inputSlot={
                <input
                  type="color"
                  id="colorPicker"
                  name="hexCode"
                  value={formData.hexCode}
                  onChange={handleInputChange}
                  className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer"
                  style={{ minWidth: 40, minHeight: 40, padding: 0 }}
                />
              }
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Status */}
          <SelectWithIcon
            label="Status"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            Icon={Tag}
            error={errors.status}
          />
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
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B45E0] focus:border-[#5B45E0] transition-all duration-200 group-hover:border-[#5B45E0] bg-white shadow-sm min-h-[80px]"
                placeholder="Enter color description"
              />
            </div>
          </div>
        </div>
        {/* Form Actions */}
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
            Create Color
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateColor; 