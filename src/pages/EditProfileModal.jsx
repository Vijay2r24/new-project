import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';

const EditProfileModal = ({ open, onClose, user }) => {
  const oInitialProfile = user || {
    name: '',
    email: '',
    phone: '',
    address: '', 
    city: '',
    state: '',
    zipCode: '',
    avatar: '',
  };
  const [aProfile, setProfile] = useState(oInitialProfile);
  const [sAvatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    setProfile(user || oInitialProfile);
    setAvatarPreview(user && user.avatar ? user.avatar : '');
    // eslint-disable-next-line
  }, [user, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Save profile changes (API call)
    alert('Profile updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-full max-w-2xl relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white ring-2 ring-sky-200/50 transition-all duration-300 group-hover:scale-105">
                {sAvatarPreview ? (
                  <img src={sAvatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <User className="h-10 w-10" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2.5 bg-white rounded-full text-sky-500 hover:bg-sky-50 transition-all duration-200 border border-sky-200 hover:scale-110 cursor-pointer">
                <Camera className="h-5 w-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TextInputWithIcon
                label="Full Name"
                id="name"
                name="name"
                value={aProfile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                Icon={User}
                required
              />
            </div>
            <div>
              <TextInputWithIcon
                label="Email Address"
                id="email"
                name="email"
                value={aProfile.email}
                onChange={handleChange}
                placeholder="Enter your email"
                Icon={Mail}
                required
              />
            </div>
            <div>
              <TextInputWithIcon
                label="Phone Number"
                id="phone"
                name="phone"
                value={aProfile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                Icon={Phone}
              />
            </div>
            <div>
              <TextInputWithIcon
                label="Street Address"
                id="address"
                name="address"
                value={aProfile.address}
                onChange={handleChange}
                placeholder="Enter your address"
                Icon={MapPin}
              />
            </div>
            <div>
              <TextInputWithIcon
                label="City"
                id="city"
                name="city"
                value={aProfile.city}
                onChange={handleChange}
                placeholder="Enter your city"
                Icon={MapPin}
              />
            </div>
            <div>
              <TextInputWithIcon
                label="State"
                id="state"
                name="state"
                value={aProfile.state}
                onChange={handleChange}
                placeholder="Enter your state"
                Icon={MapPin}
              />
            </div>
            <div>
              <TextInputWithIcon
                label="ZIP Code"
                id="zipCode"
                name="zipCode"
                value={aProfile.zipCode}
                onChange={handleChange}
                placeholder="Enter your ZIP code"
                Icon={MapPin}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-medium hover:from-sky-400 hover:to-indigo-400 border border-sky-400/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 