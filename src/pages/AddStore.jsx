import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, Users, Package, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';

const AddStore = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    status: 'Active',
    products: '',
    employees: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create store
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Store</h1>
        </div>
        <p className="text-gray-500">Create a new store location with its details and inventory information.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4">
              {/* Store Name */}
              <div className="w-full md:w-1/2">
                <TextInputWithIcon
                  label="Store Name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  placeholder="Enter store name"
                  Icon={Building}
                    required
                  />
              </div>
              {/* Street Address */}
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <TextInputWithIcon
                  label="Street Address"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  placeholder="Enter street address"
                  Icon={MapPin}
                    required
                  />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <TextInputWithIcon
                  label="City"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label="State"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label="ZIP Code"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Enter ZIP code"
                  Icon={MapPin}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInputWithIcon
                  label="Phone Number"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  placeholder="Enter phone number"
                  Icon={Phone}
                  type="tel"
                    required
                  />
              </div>
              <div>
                <TextInputWithIcon
                  label="Email Address"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  placeholder="Enter email address"
                  Icon={Mail}
                  type="email"
                    required
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Store Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Store Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SelectWithIcon
                  label="Status"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label="Number of Products"
                    id="products"
                    name="products"
                    value={formData.products}
                    onChange={handleChange}
                  placeholder="Enter number of products"
                  Icon={Package}
                  type="number"
                    min="0"
                  />
              </div>
              <div>
                <TextInputWithIcon
                  label="Number of Employees"
                    id="employees"
                    name="employees"
                    value={formData.employees}
                    onChange={handleChange}
                  placeholder="Enter number of employees"
                  Icon={Users}
                  type="number"
                    min="0"
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Create Store
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStore; 