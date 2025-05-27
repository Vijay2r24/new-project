import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Building, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';

const AddUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create user, including profileImage
    console.log('Form submitted:', formData, profileImage);
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
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
        </div>
        <p className="text-gray-500">Create a new user account with their details and permissions.</p>
      </div>

      {/* Profile Image Upload */}
      <div className="flex items-center gap-6 mb-8">
        <div>
          <img
            src={profileImagePreview || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'}
            alt="Profile Preview"
            className="h-20 w-20 rounded-full object-cover border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInputWithIcon
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  Icon={User}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label="Last Name"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  Icon={User}
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
                  placeholder="Enter email"
                  Icon={Mail}
                  type="email"
                  required
                />
              </div>
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
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <TextInputWithIcon
                  label="Password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  Icon={Lock}
                  type="password"
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  Icon={Lock}
                  type="password"
                  required
                />
              </div>
              <div>
                <SelectWithIcon
                  label="User Role"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' }
                  ]}
                  Icon={Building}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInputWithIcon
                  label="Street Address"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  Icon={MapPin}
                />
              </div>
              <div>
                <TextInputWithIcon
                  label="Pincode"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  Icon={Building}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInputWithIcon
                  label="City"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  Icon={Building}
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser; 