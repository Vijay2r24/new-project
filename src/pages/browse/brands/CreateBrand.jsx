import React, { useState } from 'react';
import { ArrowLeft, Upload, Building, Info, CheckCircle, Tag } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';

const CreateBrand = ({ setViewMode  }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'File size should be less than 10MB'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }
    if (!formData.logo) {
      newErrors.logo = 'Brand logo is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Form submitted:', formData);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full p-0 sm:p-0">
        <div className="flex items-center mb-4">
          <button
           onClick={() => setViewMode('list')}
            className="mr-3 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Create Brand</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
            {/* Brand Name */}
            <TextInputWithIcon
              label="Brand Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter brand name"
              error={errors.name}
              Icon={Building}
            />
            </div>
             <div className="w-full md:w-1/2">
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
            </div>
          </div>
          {/* Brand Logo and Description side by side */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            {/* Brand Logo */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Logo
              </label>
              <div 
                className={`relative group rounded-xl border-2 ${errors.logo ? 'border-red-300' : 'border-gray-200'} border-dashed transition-all duration-200 hover:border-[#5B45E0] bg-gray-50 hover:bg-gray-50/50`}
              >
                <div className="p-6">
                  <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                        <Upload className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                      </div>
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {formData.logo && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-green-600 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          {formData.logo.name}
                        </p>
                      </div>
                    )}
                    {errors.logo && (
                      <p className="text-sm text-red-600 flex items-center justify-center">
                        <span className="mr-1">⚠️</span>
                        {errors.logo}
                      </p>
                    )}
                  </div>
                </div>
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
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B45E0] focus:border-[#5B45E0] transition-all duration-200 group-hover:border-[#5B45E0] bg-white shadow-sm min-h-[80px]"
                  placeholder="Enter brand description"
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
              Create Brand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrand;
